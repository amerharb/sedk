import { BuilderData } from './builder'
import { Condition, Expression, PostgresBinder } from './models'
import { BooleanColumn } from './columns'
import { LogicalOperator, Parenthesis } from './steps'

export class BaseStep {
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
        return it.getStmt({ binderStore: this.data.binderStore })
      })
      result += ` ${selectPartsString.join(', ')}`
    }

    if (this.data.table) {
      result += ` FROM ${this.data.table.getStmt()}`
    }

    if (this.data.whereParts.length > 0) {
      this.throwIfWherePartsInvalid()
      const wherePartsString = this.data.whereParts.map(it => {
        if (it instanceof Condition || it instanceof Expression) {
          return it.getStmt(this.data)
        } else if (it instanceof BooleanColumn) {
          return it.getStmt()
        }
        return it.toString()
      })
      result += ` WHERE ${wherePartsString.join(' ')}`
    }

    if (this.data.groupByItems.length > 0) {
      result += ` GROUP BY ${this.data.groupByItems.map(it => it.getStmt()).join(', ')}`
    }

    if (this.data.havingParts.length > 0) {
      //TODO: check if havingParts are valid create this.throwIfHavingPartsInvalid()
      const havingPartsString = this.data.havingParts.map(it => {
        if (it instanceof Condition || it instanceof Expression) {
          return it.getStmt(this.data)
        } else if (it instanceof BooleanColumn) {
          return it.getStmt()
        }
        return it.toString()
      })
      result += ` HAVING ${havingPartsString.join(' ')}`
    }

    if (this.data.orderByItemInfos.length > 0) {
      const orderByPartsString = this.data.orderByItemInfos.map(it => {
        return it.getStmt({ binderStore: this.data.binderStore })
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
    this.data.table = undefined
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
}

