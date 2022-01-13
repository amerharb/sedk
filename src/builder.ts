import {
  Database,
  Table,
  Column,
  Condition,
  Expression,
  PostgreSqlBinder,
} from './models'
import { ColumnNotFoundError, TableNotFoundError } from './errors'
import { BinderStore } from './binder'

type ColumnLike = Column|Expression

export class ASql {
  private dbSchema: Database
  //TODO: make table array ot another kind of collection object when we add left inner join step
  private table?: Table
  private columns: ColumnLike[]
  private whereParts: (LogicalOperator|Condition|Parenthesis)[] = []
  private steps: STEPS[] = []
  private binderStore = BinderStore.getInstance()

  constructor(database: Database) {
    this.dbSchema = database
  }

  public select(...items: (ColumnLike|string|number|boolean)[]): ASql {
    const columns = items.map(it => {
      if (it instanceof Expression || it instanceof Column)
        return it
      else
        return new Expression(it)
    })
    this.throwIfColumnsNotInDb(columns)
    this.columns = columns
    this.steps.push(STEPS.SELECT)
    return this
  }

  public from(table: Table): ASql {
    this.throwIfTableNotInDb(table)
    //TODO: check that last step was SELECT before add FROM step
    this.table = table
    this.steps.push(STEPS.FROM)
    return this
  }

  public where(condition: Condition): ASql
  public where(left: Condition, operator: LogicalOperator, right: Condition): ASql
  public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): ASql
  public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): ASql {
    //TODO: check that last step was FROM before add WHERE step
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    this.steps.push(STEPS.WHERE)
    return this
  }

  public and(condition: Condition): ASql
  public and(left: Condition, operator: LogicalOperator, right: Condition): ASql
  public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): ASql
  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): ASql {
    //TODO: check that last step was WHERE or OR before add AND step
    this.whereParts.push(AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    this.steps.push(STEPS.AND)
    return this
  }

  public or(condition: Condition): ASql
  public or(left: Condition, operator: LogicalOperator, right: Condition): ASql
  public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): ASql
  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): ASql {
    //TODO: check that last step was WHERE or AND before add OR step
    this.whereParts.push(OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    this.steps.push(STEPS.OR)
    return this
  }

  private addWhereParts(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
    if (op1 === undefined && cond2 === undefined) {
      this.whereParts.push(cond1)
    } else if (op1 !== undefined && cond2 !== undefined) {
      this.whereParts.push(Parenthesis.Open)
      this.whereParts.push(cond1)
      this.whereParts.push(op1)
      this.whereParts.push(cond2)
      if (op2 !== undefined && cond3 !== undefined) {
        this.whereParts.push(op2)
        this.whereParts.push(cond3)
      }
      this.whereParts.push(Parenthesis.Close)
    }
  }

  public getSQL(): string {
    let result = `SELECT ${this.columns.join(', ')}`

    if (this.table) {
      result += ` FROM ${this.table}`
    }

    if (this.whereParts.length > 0) {
      this.throwIfWherePartsInvalid()
      result += ` WHERE ${this.whereParts.join(' ')}`
    }

    // clean up
    this.steps.length = 0
    this.whereParts.length = 0
    this.steps.length = 0
    this.table = undefined

    return result
  }

  public getPostgresqlBinding(): PostgreSqlBinder {
    return { sql: this.getSQL(), values: this.binderStore.getValues() }
  }

  /**
   * This function throws error if WhereParts Array where invalid
   * it check the number of open and close parentheses in the conditions
   */
  private throwIfWherePartsInvalid() {
    let pCounter = 0
    for (let i = 0; i < this.whereParts.length; i++) {
      if (this.whereParts[i] === Parenthesis.Open) {
        pCounter++
        if (i < this.whereParts.length - 1)
          if (this.whereParts[i + 1] === Parenthesis.Close)
            throw new Error('invalid conditions build, empty parenthesis is not allowed')
      }

      if (this.whereParts[i] === Parenthesis.Close)
        pCounter--

      if (pCounter < 0) // Close comes before Open
        throw new Error('invalid conditions build, closing parentheses must not occur after Opening one')
    }

    if (pCounter > 0) // Opening more than closing
      throw new Error('invalid conditions build, opening parentheses is more than closing ones')

    if (pCounter < 0) // Closing more than opening
      throw new Error('invalid conditions build, closing parentheses is more than opening ones')
  }

  private throwIfColumnsNotInDb(columns: ColumnLike[]) {
    for (const column of columns) {
      if (column instanceof Expression) {
        this.throwIfColumnsNotInDb(ASql.getColumnsFromExpression(column))
        continue
      }
      // TODO: move search function into database model
      let found = false
      COL:
      //TODO: filter only the table in the current query
      for (const table of this.dbSchema.getTables()) {
        for (const col of table.getColumn()) {
          if (column === col) {
            found = true
            break COL
          }
        }
      }
      if (!found)
        throw new ColumnNotFoundError(`Column: ${column} not found`)
    }
  }

  public static getColumnsFromExpression(expression: Expression): Column[] {
    const columns: Column[] = []
    if (expression.left instanceof Column)
      columns.push(expression.left)
    else if (expression.left instanceof Expression)
      columns.push(...ASql.getColumnsFromExpression(expression.left))

    if (expression.right instanceof Column)
      columns.push(expression.right)
    else if (expression.right instanceof Expression)
      columns.push(...ASql.getColumnsFromExpression(expression.right))

    return columns
  }

  private throwIfTableNotInDb(table: Table) {
    let found = false
    // TODO: move search function into database model
    for (const t of this.dbSchema.getTables()) {
      if (table === t) {
        found = true
        break
      }
    }
    if (!found)
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
