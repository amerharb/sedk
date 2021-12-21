'use strict'
import {
  Database,
  Table,
  Column,
  Condition,
} from './model'

export class ASql {
  private dbSchema: Database
  private table: Table
  private columns: Column[]
  private operationConditions: (OperatorCondition | Group)[] = []
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

  public where(condition: Condition): ASql;
  public where(left: Condition, operator: Operator, right: Condition): ASql;
  public where(left: Condition, operator?: Operator, right?: Condition): ASql {
    //TODO: check that last step was FROM before add WHERE step
    if (operator === undefined && right === undefined) {
      this.operationConditions.push(new OperatorCondition(null, left))
    } else if (operator !== undefined && right !== undefined ) {
      this.operationConditions.push(Group.Open)
      this.operationConditions.push(new OperatorCondition(null, left))
      this.operationConditions.push(new OperatorCondition(operator, right))
      this.operationConditions.push(Group.Close)
    }
    this.steps.push(STEPS.WHERE)
    return this
  }

  public and(condition: Condition): ASql {
    //TODO: check that last step was WHERE or OR before add AND step
    this.operationConditions.push(new OperatorCondition(Operator.AND, condition))
    this.steps.push(STEPS.AND)
    return this
  }

  public or(condition: Condition): ASql {
    //TODO: check that last step was WHERE or AND before add OR step
    this.operationConditions.push(new OperatorCondition(Operator.OR, condition))
    this.steps.push(STEPS.OR)
    return this
  }

  public getSQL(): string {
    let result = `SELECT ${this.columns.join(', ')}
                      FROM ${this.table}
        `
    if (this.operationConditions && this.operationConditions.length > 0) {
      result += ' WHERE'
      let i = 0
      let opCond = this.operationConditions[i]
      // TODO: generalize this code for case where there will Open and Close Group after first Where
      if (opCond instanceof OperatorCondition) {
        result += ` ${opCond.getCondition()}` //first cond has no operator
      } else {
        if (opCond === Group.Open) {
          const nextOpCond = this.operationConditions[i + 1]
          if (nextOpCond instanceof OperatorCondition)
            result += ` ${Group.Open} ` //first cond has no operator
        }
        i++
        opCond = this.operationConditions[i]
        if (opCond instanceof OperatorCondition)
          result += ` ${opCond.getCondition()}`
        i++
        opCond = this.operationConditions[i]
        if (opCond instanceof OperatorCondition)
          result += ` ${opCond.getOperator()} ${opCond.getCondition()}`
        i++
        opCond = this.operationConditions[i]
        if (opCond === Group.Close)
          result += ` ${opCond}`
      }
      i++
      while (i < this.operationConditions.length) {
        opCond = this.operationConditions[i]
        if (opCond instanceof OperatorCondition) {
          result += ` ${opCond.getOperator()} ${opCond.getCondition()}`
        }
        i++
      }

    }

    // clean up
    this.steps.length = 0
    this.operationConditions.length = 0

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

enum Group {
    Open = '(',
    Close = ')',
}

export enum Operator {
    AND = 'AND',
    OR = 'OR',
}
