import { BuilderData, SqlPath } from '../builder'
import { PrimitiveType } from '../models/types'
import { Condition } from '../models/Condition'
import { Expression } from '../models/Expression'
import { BooleanColumn } from '../columns'
import { LogicalOperator } from '../operators'

export enum Parenthesis {
  Open = '(',
  Close = ')',
}

export abstract class BaseStep {
  constructor(protected data: BuilderData) {}

  public getSQL(): string {
    return this.getStatement()
  }

  public getBindValues(): PrimitiveType[] {
    return [...this.data.binderStore.getValues()]
  }

  private getStatement(): string {
    let result = `${this.data.sqlPath}${this.data.distinct}`

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
      BaseStep.throwIfConditionPartsInvalid(this.data.whereParts)
      const wherePartsString = this.data.whereParts.map(it => {
        if (it instanceof Condition || it instanceof Expression || it instanceof BooleanColumn) {
          return it.getStmt(this.data)
        }
        return it.toString()
      })
      result += ` WHERE ${wherePartsString.join(' ')}`
    } else if (this.data.sqlPath === SqlPath.DELETE && this.data.option.throwErrorIfDeleteHasNoCondition) {
      throw new Error(`Delete statement must have where conditions or set throwErrorIfDeleteHasNoCondition option to false`)
    }

    if (this.data.groupByItems.length > 0) {
      result += ` GROUP BY ${this.data.groupByItems.map(it => it.getStmt(this.data)).join(', ')}`
    }

    if (this.data.havingParts.length > 0) {
      BaseStep.throwIfConditionPartsInvalid(this.data.havingParts)
      const havingPartsString = this.data.havingParts.map(it => {
        if (it instanceof Condition || it instanceof Expression || it instanceof BooleanColumn) {
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
    BaseStep.addConditionParts(this.data.whereParts, cond1, op1, cond2, op2, cond3)
  }

  protected addHavingParts(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
    BaseStep.addConditionParts(this.data.havingParts, cond1, op1, cond2, op2, cond3)
  }

  private static addConditionParts(conditionArray: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
    cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
    if (op1 === undefined && cond2 === undefined) {
      conditionArray.push(cond1)
    } else if (op1 !== undefined && cond2 !== undefined) {
      conditionArray.push(Parenthesis.Open)
      conditionArray.push(cond1)
      conditionArray.push(op1)
      conditionArray.push(cond2)
      if (op2 !== undefined && cond3 !== undefined) {
        conditionArray.push(op2)
        conditionArray.push(cond3)
      }
      conditionArray.push(Parenthesis.Close)
    }
  }

  /**
   * This function throws error if WhereParts Array where invalid
   * it check the number of open and close parentheses in the conditions
   */
  private static throwIfConditionPartsInvalid(conditionsArray: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[]) {
    let pCounter = 0
    for (let i = 0; i < conditionsArray.length; i++) {
      if (conditionsArray[i] === Parenthesis.Open) {
        pCounter++
        if (i < conditionsArray.length - 1)
          if (conditionsArray[i + 1] === Parenthesis.Close) {
            throw new Error('invalid conditions build, empty parentheses are not allowed')
          }
      }

      if (conditionsArray[i] === Parenthesis.Close)
        pCounter--

      if (pCounter < 0) {// Close comes before Open
        throw new Error('invalid conditions build, closing parenthesis must occur after Opening one')
      }
    }

    if (pCounter > 0) // Opening more than closing
      throw new Error('invalid conditions build, opening parentheses are more than closing ones')

    if (pCounter < 0) // Closing more than opening
      throw new Error('invalid conditions build, closing parentheses are more than opening ones')
  }
}

