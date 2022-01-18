import {
  Table,
  Condition,
  PostgresBinder,
} from './models'
import { TableNotFoundError } from './errors'
import { BuilderData } from './builder'

export class Step {
  constructor(protected data: BuilderData) {}

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

  public cleanUp() {
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
  protected throwIfWherePartsInvalid() {
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

  protected throwIfTableNotInDb(table: Table) {
    if (!this.data.dbSchema.isTableExist(table))
      throw new TableNotFoundError(`Table: ${table} not found`)
  }

  protected addWhereParts(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
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

export class SelectStep extends Step {
  public from(table: Table): FromStep {
    this.throwIfTableNotInDb(table)
    this.data.table = table

    const step = new FromStep(this.data)
    this.data.steps.push(step)
    return step
  }
}

class FromStep extends Step {
  public where(condition: Condition): WhereStep
  public where(left: Condition, operator: LogicalOperator, right: Condition): WhereStep
  public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereStep
  public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): WhereStep {
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    const step = new WhereStep(this.data)
    this.data.steps.push(step)
    return step
  }
}

class WhereStep extends Step {
  public and(condition: Condition): AndStep
  public and(left: Condition, operator: LogicalOperator, right: Condition): AndStep
  public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): AndStep
  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): AndStep {
    this.data.whereParts.push(AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    const step = new AndStep(this.data)
    this.data.steps.push(step)
    return step
  }

  public or(condition: Condition): OrStep
  public or(left: Condition, operator: LogicalOperator, right: Condition): OrStep
  public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): OrStep
  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): OrStep {
    this.data.whereParts.push(OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    const step = new OrStep(this.data)
    this.data.steps.push(step)
    return step
  }
}

class AndStep extends Step {
  public and(condition: Condition): AndStep
  public and(left: Condition, operator: LogicalOperator, right: Condition): AndStep
  public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): AndStep
  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): AndStep {
    this.data.whereParts.push(AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    const step = new AndStep(this.data)
    this.data.steps.push(step)
    return step
  }

  public or(condition: Condition): OrStep
  public or(left: Condition, operator: LogicalOperator, right: Condition): OrStep
  public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): OrStep
  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): OrStep {
    this.data.whereParts.push(OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    const step = new OrStep(this.data)
    this.data.steps.push(step)
    return step
  }
}

class OrStep extends Step {
  public or(condition: Condition): OrStep
  public or(left: Condition, operator: LogicalOperator, right: Condition): OrStep
  public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): OrStep
  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): OrStep {
    this.data.whereParts.push(OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    const step = new OrStep(this.data)
    this.data.steps.push(step)
    return step
  }

  public and(condition: Condition): AndStep
  public and(left: Condition, operator: LogicalOperator, right: Condition): AndStep
  public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): AndStep
  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): AndStep {
    this.data.whereParts.push(AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    const step = new AndStep(this.data)
    this.data.steps.push(step)
    return step
  }
}

//Aliases
export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

const AND = LogicalOperator.AND
const OR = LogicalOperator.OR

export enum Parenthesis {
  Open = '(',
  Close = ')',
}
