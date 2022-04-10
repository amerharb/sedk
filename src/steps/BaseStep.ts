import { BuilderData } from '../builder'
import { Condition } from '../models/Condition'
import { PostgresBinder } from '../models/types'
import { Expression } from '../models/Expression'
import { BooleanColumn } from '../columns'
import { LogicalOperator } from '../operators'

export enum Parenthesis {
  Open = '(',
  Close = ')',
}

enum ConditionType {
  WherePart,
  HavingPart,
  OnPart,
}

export abstract class BaseStep {
  constructor(protected data: BuilderData) {}

  public getSQL(): string {
    return this.getStatement()
  }

  public getBinds(): PostgresBinder {
    return {
      sql: this.getStatement(),
      values: this.data.binderStore.getValues(),
    }
  }

  private getStatement(): string {
    let result = `SELECT${this.data.distinct}`

    if (this.data.selectItemInfos.length > 0) {
      const selectPartsString = this.data.selectItemInfos.map(it => {
        return it.getStmt(this.data)
      })
      result += ` ${selectPartsString.join(', ')}`
    }

    if (this.data.fromItemInfos.length > 0) {
      result += ` FROM ${this.data.fromItemInfos.map(it => it.getStmt(this.data)).join('')}`
    }

    if (this.data.whereParts.length > 0) {
      this.throwIfConditionPartsInvalid(ConditionType.WherePart)
      const wherePartsString = this.data.whereParts.map(it => {
        if (it instanceof Condition || it instanceof Expression) {
          return it.getStmt(this.data)
        } else if (it instanceof BooleanColumn) {
          return it.getStmt(this.data)
        }
        return it.toString()
      })
      result += ` WHERE ${wherePartsString.join(' ')}`
    }

    if (this.data.groupByItems.length > 0) {
      result += ` GROUP BY ${this.data.groupByItems.map(it => it.getStmt(this.data)).join(', ')}`
    }

    if (this.data.havingParts.length > 0) {
      this.throwIfConditionPartsInvalid(ConditionType.HavingPart)
      const havingPartsString = this.data.havingParts.map(it => {
        if (it instanceof Condition || it instanceof Expression) {
          return it.getStmt(this.data)
        } else if (it instanceof BooleanColumn) {
          return it.getStmt(this.data)
        }
        return it.toString()
      })
      result += ` HAVING ${havingPartsString.join(' ')}`
    }

    if (this.data.orderByItemInfos.length > 0) {
      const orderByPartsString = this.data.orderByItemInfos.map(it => {
        return it.getStmt(this.data)
      })
      result += ` ORDER BY ${orderByPartsString.join(', ')}`
    }

    if (this.data.limit !== undefined) {
      if (this.data.limit === null) {
        result += ' LIMIT NULL'
      } else {
        result += ` LIMIT ${this.data.limit}`
      }
    }

    if (this.data.offset !== undefined) {
      result += ` OFFSET ${this.data.offset}`
    }

    if (this.data.option.useSemicolonAtTheEnd)
      result += ';'

    return result
  }

  public cleanUp() {
    this.data.selectItemInfos.length = 0
    this.data.distinct = ''
    this.data.fromItemInfos.length = 0
    this.data.whereParts.length = 0
    this.data.groupByItems.length = 0
    this.data.havingParts.length = 0
    this.data.orderByItemInfos.length = 0
    this.data.limit = undefined
    this.data.offset = undefined
    this.data.binderStore.cleanUp()
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

  protected addHavingParts(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
    if (op1 === undefined && cond2 === undefined) {
      this.data.havingParts.push(cond1)
    } else if (op1 !== undefined && cond2 !== undefined) {
      this.data.havingParts.push(Parenthesis.Open)
      this.data.havingParts.push(cond1)
      this.data.havingParts.push(op1)
      this.data.havingParts.push(cond2)
      if (op2 !== undefined && cond3 !== undefined) {
        this.data.havingParts.push(op2)
        this.data.havingParts.push(cond3)
      }
      this.data.havingParts.push(Parenthesis.Close)
    }
  }

  /**
   * This function throws error if WhereParts Array where invalid
   * it check the number of open and close parentheses in the conditions
   */
  private throwIfConditionPartsInvalid(conditionType: ConditionType) {
    const conditionsArray = this.getCondtionArray(conditionType)
    let pCounter = 0
    for (let i = 0; i < conditionsArray.length; i++) {
      if (conditionsArray[i] === Parenthesis.Open) {
        pCounter++
        if (i < conditionsArray.length - 1)
          if (conditionsArray[i + 1] === Parenthesis.Close) {
            throw new Error('invalid conditions build, empty parenthesis is not allowed')
          }
      }

      if (conditionsArray[i] === Parenthesis.Close)
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

  private getCondtionArray(conditionType: ConditionType): (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] {
    switch (conditionType) {
    case ConditionType.WherePart:
      return this.data.whereParts
    case ConditionType.HavingPart:
      return this.data.havingParts
    case ConditionType.OnPart:
      // TODO: write implementation
      // return this.data.onParts
      throw new Error('On Parts are not implemented yet')
    default:
      throw new Error('Invalid condition type')
    }
  }
}

