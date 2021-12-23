'use strict'
import {
  Database,
  Table,
  Column,
  Condition,
} from './model'

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
  private whereParts: (OperatorCondition|Parenthesis)[] = []
  private steps: STEPS[] = []

  constructor(database: Database) {
    this.dbSchema = database
  }

  public select(...columns: Column[]): ASql {
    //TODO check that these columns are part of database
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
  public where(left: Condition, operator?: Operator, right?: Condition): ASql {
    //TODO: check that last step was FROM before add WHERE step
    if (operator === undefined && right === undefined) {
      this.whereParts.push(new OperatorCondition(null, left))
    } else if (operator !== undefined && right !== undefined) {
      this.whereParts.push(Parenthesis.Open)
      this.whereParts.push(new OperatorCondition(null, left))
      this.whereParts.push(new OperatorCondition(operator, right))
      this.whereParts.push(Parenthesis.Close)
    }
    this.steps.push(STEPS.WHERE)
    return this
  }

  public and(condition: Condition): ASql
  public and(left: Condition, operator: Operator, right: Condition): ASql
  public and(left: Condition, operator?: Operator, right?: Condition): ASql {
    //TODO: check that last step was WHERE or OR before add AND step
    if (operator === undefined && right === undefined) {
      this.whereParts.push(new OperatorCondition(AND, left))
    } else if (operator !== undefined && right !== undefined) {
      this.whereParts.push(Parenthesis.Open)
      this.whereParts.push(new OperatorCondition(AND, left))
      this.whereParts.push(new OperatorCondition(operator, right))
      this.whereParts.push(Parenthesis.Close)
    }
    this.steps.push(STEPS.AND)
    return this
  }

  public or(condition: Condition): ASql
  public or(left: Condition, operator: Operator, right: Condition): ASql
  public or(left: Condition, operator?: Operator, right?: Condition): ASql {
    //TODO: check that last step was WHERE or AND before add OR step
    if (operator === undefined && right === undefined) {
      this.whereParts.push(new OperatorCondition(OR, left))
    } else if (operator !== undefined && right !== undefined) {
      this.whereParts.push(Parenthesis.Open)
      this.whereParts.push(new OperatorCondition(OR, left))
      this.whereParts.push(new OperatorCondition(operator, right))
      this.whereParts.push(Parenthesis.Close)
    }
    this.steps.push(STEPS.OR)
    return this
  }

  public getSQL(): string {
    let result = `SELECT ${this.columns.join(', ')} FROM ${this.table}`
    if (this.whereParts && this.whereParts.length > 0) {
      /* TODO: validate the array
          1. first oc (operationCondition) has null operator, this not necessarily index 0, as array could start with open_group
          2. number of open_group equal number of close_group
          3. open_group comes always before close_group e.g. ( then ) ok, but ) then ( not ok
          4. no empty group, so no (), there should be at least one oc in between
       */
      result += ' WHERE'
      let wherePartCounter = 0
      let parenthesisCounter = 0
      let opCond:OperatorCondition|Parenthesis

      while (wherePartCounter < this.whereParts.length) {
        opCond = this.whereParts[wherePartCounter]
        if (opCond instanceof OperatorCondition) {
          result += ` ${opCond.getOperator() ?? ''} ${Parenthesis.Open.repeat(parenthesisCounter)} ${opCond.getCondition()}`
          parenthesisCounter = 0
        } else if ( opCond === Parenthesis.Open) {
          parenthesisCounter++
        } else if ( opCond === Parenthesis.Close){
          result += ` ${opCond}`
        }
        wherePartCounter++
      }
    }

    // clean up
    this.steps.length = 0
    this.whereParts.length = 0

    return result
  }
}

enum STEPS {
    SELECT = 'select',
    FROM = 'from',
    WHERE = 'where',
    AND = 'and',
    OR = 'or',
}

export class OperatorCondition {
  private readonly operator: Operator | null
  private readonly condition: Condition

  constructor(operator: Operator | null, condition: Condition) {
    this.operator = operator
    this.condition = condition
  }

  public getOperator(): Operator | null {
    return this.operator
  }

  public getCondition(): Condition {
    return this.condition
  }
}

enum Parenthesis {
    Open = '(',
    Close = ')',
}
