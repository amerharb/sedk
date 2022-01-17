import {
  Database,
  Table,
  Column,
  Condition,
  Expression,
  PostgresBinder,
} from './models'
import { ColumnNotFoundError, TableNotFoundError } from './errors'
import { BinderStore } from './binder'

type ColumnLike = Column|Expression

type BuilderData = {
  dbSchema: Database,
  //TODO: make table array ot another kind of collection object when we add leftOperand inner join step
  table?: Table,
  columns: ColumnLike[],
  whereParts: (LogicalOperator|Condition|Parenthesis)[],
  steps: STEPS[],
  binderStore: BinderStore,
}

export class Builder {
  private data: BuilderData

  constructor(database: Database) {
    this.data = {
      dbSchema: database,
      table: undefined,
      columns: [],
      whereParts: [],
      steps: [],
      binderStore: BinderStore.getInstance(),
    }
  }

  public select(...items: (ColumnLike|string|number|boolean)[]): Builder {
    const columns = items.map(it => {
      if (it instanceof Expression || it instanceof Column)
        return it
      else
        return new Expression(it)
    })
    this.throwIfColumnsNotInDb(columns)
    //Note: the cleanup needed as is one select in the chain also we start with it always
    this.cleanUp()
    this.data.columns.push(...columns)
    this.data.steps.push(STEPS.SELECT)
    return this
  }

  public from(table: Table): Builder {
    this.throwIfTableNotInDb(table)
    //TODO: check that last step was SELECT before add FROM step
    this.data.table = table
    this.data.steps.push(STEPS.FROM)
    return this
  }

  public where(condition: Condition): Builder
  public where(left: Condition, operator: LogicalOperator, right: Condition): Builder
  public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): Builder
  public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): Builder {
    //TODO: check that last step was FROM before add WHERE step
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    this.data.steps.push(STEPS.WHERE)
    return this
  }

  public and(condition: Condition): Builder
  public and(left: Condition, operator: LogicalOperator, right: Condition): Builder
  public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): Builder
  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): Builder {
    //TODO: check that last step was WHERE or OR before add AND step
    this.data.whereParts.push(AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    this.data.steps.push(STEPS.AND)
    return this
  }

  public or(condition: Condition): Builder
  public or(left: Condition, operator: LogicalOperator, right: Condition): Builder
  public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): Builder
  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): Builder {
    //TODO: check that last step was WHERE or AND before add OR step
    this.data.whereParts.push(OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    this.data.steps.push(STEPS.OR)
    return this
  }

  private addWhereParts(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
    if (op1 === undefined && cond2 === undefined) {
      this.data.whereParts.push(cond1)
    } else if (op1 !== undefined && cond2 !== undefined) {
      this.data.whereParts.push(Parenthesis.Open)
      this.data.whereParts.push(cond1)
      this.data.whereParts.push(op1)
      this.data.whereParts.push(cond2)
      if (op2 !== undefined && cond3 !== undefined) {
        this.data.whereParts.push(op2)
        this.data.whereParts.push(cond3)
      }
      this.data.whereParts.push(Parenthesis.Close)
    }
  }

  public getSQL(): string {
    const result = this.getStatement()
    this.cleanUp()
    return result
  }

  public getPostgresqlBinding(): PostgresBinder {
    const result = {
      sql: this.getStatement(),
      values: this.data.binderStore.getValues(),
    }
    this.cleanUp()
    return result
  }

  private getStatement(): string {
    let result = `SELECT ${this.data.columns.join(', ')}`

    if (this.data.table) {
      result += ` FROM ${this.data.table}`
    }

    if (this.data.whereParts.length > 0) {
      this.throwIfWherePartsInvalid()
      result += ` WHERE ${this.data.whereParts.join(' ')}`
    }
    return result
  }

  private cleanUp() {
    this.data.steps.length = 0
    this.data.whereParts.length = 0
    this.data.columns.length = 0
    this.data.table = undefined
    this.data.binderStore.getValues() // when binder return the values its clean up
  }

  /**
   * This function throws error if WhereParts Array where invalid
   * it check the number of open and close parentheses in the conditions
   */
  private throwIfWherePartsInvalid() {
    let pCounter = 0
    for (let i = 0; i < this.data.whereParts.length; i++) {
      if (this.data.whereParts[i] === Parenthesis.Open) {
        pCounter++
        if (i < this.data.whereParts.length - 1)
          if (this.data.whereParts[i + 1] === Parenthesis.Close) {
            throw new Error('invalid conditions build, empty parenthesis is not allowed')
          }
      }

      if (this.data.whereParts[i] === Parenthesis.Close)
        pCounter--

      if (pCounter < 0) {// Close comes before Open
        throw new Error('invalid conditions build, closing parentheses must not occur after Opening one')
      }
    }

    if (pCounter > 0) // Opening more than closing
      throw new Error('invalid conditions build, opening parentheses is more than closing ones')

    if (pCounter < 0) // Closing more than opening
      throw new Error('invalid conditions build, closing parentheses is more than opening ones')
  }

  private throwIfColumnsNotInDb(columns: ColumnLike[]) {
    for (const column of columns) {
      if (column instanceof Expression) {
        this.throwIfColumnsNotInDb(Builder.getColumnsFromExpression(column))
        continue
      }
      // TODO: move search function into database model
      let found = false
      //@formatter:off
      COL:
      //TODO: filter only the table in the current query
      for (const table of this.data.dbSchema.getTables()) {
        for (const col of table.getColumn()) {
          if (column === col) {
            found = true
            break COL
          }
        }
      }
      //@formatter:on
      if (!found)
        throw new ColumnNotFoundError(`Column: ${column} not found`)
    }
  }

  private static getColumnsFromExpression(expression: Expression): Column[] {
    const columns: Column[] = []
    if (expression.leftOperand.value instanceof Column)
      columns.push(expression.leftOperand.value)
    else if (expression.leftOperand.value instanceof Expression)
      columns.push(...Builder.getColumnsFromExpression(expression.leftOperand.value))

    if (expression.rightOperand?.value instanceof Column)
      columns.push(expression.rightOperand.value)
    else if (expression.rightOperand?.value instanceof Expression)
      columns.push(...Builder.getColumnsFromExpression(expression.rightOperand.value))

    return columns
  }

  private throwIfTableNotInDb(table: Table) {
    if (!this.data.dbSchema.isTableExist(table))
      throw new TableNotFoundError(`Table: ${table} not found`)
  }
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

//Aliases
const AND = LogicalOperator.AND
const OR = LogicalOperator.OR

enum STEPS {
  SELECT = 'select',
  FROM = 'from',
  WHERE = 'where',
  AND = 'and',
  OR = 'or',
}

enum Parenthesis {
  Open = '(',
  Close = ')',
}
