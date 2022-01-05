import {
  Database,
  Table,
  Column,
  Condition,
} from './model'
import { ColumnNotFoundError } from './Errors'

export enum Operator {
  AND = 'AND',
  OR = 'OR',
}

//Aliases
const AND = Operator.AND
const OR = Operator.OR

export class ASql {
  private dbSchema: Database
  private table: Table
  private columns: Column[]
  private whereParts: (Operator|Condition|Parenthesis)[] = []
  private steps: STEPS[] = []

  constructor(database: Database) {
    this.dbSchema = database
  }

  public select(...columns: Column[]): ASql {
    //TODO check that these columns are part of database
    this.throwIfColumnsNotInDb(columns)
    this.columns = columns
    this.steps.push(STEPS.SELECT)
    return this
  }

  public from(table: Table): ASql {
    //TODO check if this table are part of database
    //TODO: check that last step was SELECT before add FROM step
    this.table = table
    this.steps.push(STEPS.FROM)
    return this
  }

  public where(condition: Condition): ASql
  public where(left: Condition, operator: Operator, right: Condition): ASql
  public where(left: Condition, operator1: Operator, middle: Condition, operator2: Operator, right: Condition): ASql
  public where(cond1: Condition, op1?: Operator, cond2?: Condition, op2?: Operator, cond3?: Condition): ASql {
    //TODO: check that last step was FROM before add WHERE step
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    this.steps.push(STEPS.WHERE)
    return this
  }

  public and(condition: Condition): ASql
  public and(left: Condition, operator: Operator, right: Condition): ASql
  public and(left: Condition, operator1: Operator, middle: Condition, operator2: Operator, right: Condition): ASql
  public and(cond1: Condition, op1?: Operator, cond2?: Condition, op2?: Operator, cond3?: Condition): ASql {
    //TODO: check that last step was WHERE or OR before add AND step
    this.whereParts.push(AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    this.steps.push(STEPS.AND)
    return this
  }

  public or(condition: Condition): ASql
  public or(left: Condition, operator: Operator, right: Condition): ASql
  public or(left: Condition, operator1: Operator, middle: Condition, operator2: Operator, right: Condition): ASql
  public or(cond1: Condition, op1?: Operator, cond2?: Condition, op2?: Operator, cond3?: Condition): ASql {
    //TODO: check that last step was WHERE or AND before add OR step
    this.whereParts.push(OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    this.steps.push(STEPS.OR)
    return this
  }

  private addWhereParts(cond1: Condition, op1?: Operator, cond2?: Condition, op2?: Operator, cond3?: Condition) {
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
    let result = `SELECT ${this.columns.join(', ')}
                  FROM ${this.table}`
    if (this.whereParts && this.whereParts.length > 0) {
      this.validateWhereParts()
      result += ` WHERE ${this.whereParts.join(' ')}`
    }

    // clean up
    this.steps.length = 0
    this.whereParts.length = 0

    return result
  }

  /**
   * This function throws error if WhereParts Array where invalid
   * it check the number of open and close parentheses in the conditions
   */
  private validateWhereParts() {
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

  private throwIfColumnsNotInDb(columns: Column[]) {
    for (const column of columns) {
      // TODO: move search function into database model
      let found = false
      COL:
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
}

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
