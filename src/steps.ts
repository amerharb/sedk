import { Condition, Expression, PostgresBinder } from './models'
import { Column, Table } from './schema'
import { ColumnNotFoundError, TableNotFoundError } from './errors'
import { BuilderData } from './builder'

export type ColumnLike = Column|Expression
export type PrimitiveType = null|boolean|number|string

class Asterisk {
  private static instance: Asterisk

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): Asterisk {
    if (!Asterisk.instance) {
      Asterisk.instance = new Asterisk()
    }
    return Asterisk.instance
  }

  public toString(): string {
    return '*'
  }
}

export const ASTERISK = Asterisk.getInstance()
export type SelectItem = ColumnLike|Asterisk

export class Step implements BaseStep, RootStep, SelectStep, FromStep, AndStep, OrStep, OrderByStep {
  constructor(protected data: BuilderData) {}

  public select(...items: (SelectItem|PrimitiveType)[]): SelectStep {
    const selectItems: SelectItem[] = items.map(it => {
      if (it instanceof Expression || it instanceof Column || it instanceof Asterisk)
        return it
      else
        return new Expression(it)
    })
    this.throwIfColumnsNotInDb(selectItems)
    //Note: the cleanup needed as there is only one "select" step in the chain that we start with
    this.cleanUp()
    this.data.selectItems.push(...selectItems)
    return this
  }

  public from(table: Table): FromStep {
    this.throwIfTableNotInDb(table)
    this.data.table = table

    return this
  }

  public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): WhereStep {
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): AndStep {
    this.data.whereParts.push(AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): OrStep {
    this.data.whereParts.push(OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  orderBy(...columns: Column[]): OrderByStep {
    this.data.orderByItems.push(...columns)
    return this
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
    let result = `SELECT ${this.data.selectItems.join(', ')}`

    if (this.data.table) {
      result += ` FROM ${this.data.table}`
    }

    if (this.data.whereParts.length > 0) {
      this.throwIfWherePartsInvalid()
      result += ` WHERE ${this.data.whereParts.join(' ')}`
    }

    if (this.data.orderByItems.length > 0) {
      result += ` ORDER BY ${this.data.orderByItems.join(', ')}`
    }

    if (this.data.option.useSemicolonAtTheEnd)
      result += ';'

    return result
  }

  public cleanUp() {
    this.data.selectItems.length = 0
    this.data.whereParts.length = 0
    this.data.orderByItems.length = 0
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
        throw new Error('invalid conditions build, closing parentheses must occur after Opening one')
      }
    }

    if (pCounter > 0) // Opening more than closing
      throw new Error('invalid conditions build, opening parentheses is more than closing ones')

    if (pCounter < 0) // Closing more than opening
      throw new Error('invalid conditions build, closing parentheses is more than opening ones')
  }

  private throwIfTableNotInDb(table: Table) {
    if (!this.data.dbSchema.isTableExist(table))
      throw new TableNotFoundError(`Table: ${table} not found`)
  }

  private throwIfColumnsNotInDb(columns: (ColumnLike|Asterisk)[]) {
    for (const column of columns) {
      if (column instanceof Asterisk) {
        continue
      } else if (column instanceof Expression) {
        this.throwIfColumnsNotInDb(Step.getColumnsFromExpression(column))
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
      columns.push(...Step.getColumnsFromExpression(expression.leftOperand.value))

    if (expression.rightOperand?.value instanceof Column)
      columns.push(expression.rightOperand.value)
    else if (expression.rightOperand?.value instanceof Expression)
      columns.push(...Step.getColumnsFromExpression(expression.rightOperand.value))

    return columns
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
}

interface BaseStep {
  getSQL(): string
  getPostgresqlBinding(): PostgresBinder
  cleanUp(): void
}

export interface RootStep extends BaseStep {
  select(...items: SelectItem[]): SelectStep
}

export interface SelectStep extends BaseStep {
  from(table: Table): FromStep
}

export interface FromStep extends BaseStep {
  where(condition: Condition): WhereStep
  where(left: Condition, operator: LogicalOperator, right: Condition): WhereStep
  where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereStep

  orderBy(...columns: Column[]): OrderByStep
}

interface WhereStep extends BaseStep {
  and(condition: Condition): AndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): AndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): AndStep

  or(condition: Condition): OrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): OrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): OrStep

  orderBy(...columns: Column[]): OrderByStep
}

interface AndStep extends BaseStep {
  and(condition: Condition): AndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): AndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): AndStep

  or(condition: Condition): OrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): OrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): OrStep

  orderBy(...columns: Column[]): OrderByStep
}

interface OrStep extends BaseStep {
  or(condition: Condition): OrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): OrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): OrStep

  and(condition: Condition): AndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): AndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): AndStep

  orderBy(...columns: Column[]): OrderByStep
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface OrderByStep extends BaseStep {
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

//Aliases
const AND = LogicalOperator.AND
const OR = LogicalOperator.OR

export enum Parenthesis {
  Open = '(',
  Close = ')',
}
