import { Binder } from '../binder'
import { Expression, ExpressionType } from './Expression'
import { BuilderData } from '../builder'
import { AggregateFunction } from '../aggregateFunction'
import { BooleanColumn, Column, NumberColumn, TextColumn } from '../columns'
import { OperandType } from '../models'

export class Operand {
  public value?: OperandType|Binder
  public type: ExpressionType
  public isNot: boolean

  constructor(value?: OperandType|Binder, isNot?: boolean) {
    this.value = value
    this.type = Operand.getExpressionType(value)
    this.isNot = Operand.getNotValueOrThrow(isNot, this.type)
  }

  public getStmt(data: BuilderData): string {
    if (this.value === null) {
      return 'NULL'
    } else if (this.value instanceof Binder) {
      if (this.value.no === undefined) {
        data.binderStore.add(this.value)
      }
      return `${this.value.getStmt()}`
    } else if (typeof this.value === 'string') {
      // escape single quote by repeating it
      const escapedValue = this.value.replace(/'/g, '\'\'')
      return `'${escapedValue}'`
    } else if (typeof this.value === 'boolean') {
      return `${this.isNot ? 'NOT ' : ''}${this.value ? 'TRUE' : 'FALSE'}`
    } else if (this.value instanceof AggregateFunction) {
      return `${this.isNot ? 'NOT ' : ''}${this.value.getStmt(data)}`
    } else if (this.value instanceof Expression) {
      return `${this.isNot ? 'NOT ' : ''}${this.value.getStmt(data)}`
    } else if (this.value instanceof Column) {
      return `${this.isNot ? 'NOT ' : ''}${this.value.getStmt()}`
    } else if (typeof this.value === 'number') {
      return `${this.isNot ? 'NOT ' : ''}${this.value}`
    } else { // value here is undefined
      return `${this.isNot ? 'NOT' : ''}`
    }
  }

  private static getExpressionType(operand?: OperandType|Binder): ExpressionType {
    if (operand === undefined) {
      return ExpressionType.NOT_EXIST
    } else if (operand === null) {
      return ExpressionType.NULL
    } else if (typeof operand === 'boolean' || operand instanceof BooleanColumn) {
      return ExpressionType.BOOLEAN
    } else if (typeof operand === 'number' || operand instanceof NumberColumn) {
      return ExpressionType.NUMBER
    } else if (typeof operand === 'string' || operand instanceof TextColumn) {
      return ExpressionType.TEXT
    } else if (operand instanceof AggregateFunction) {
      return ExpressionType.NUMBER
    } else if (operand instanceof Expression) {
      return operand.type
    } else if (operand instanceof Binder) {
      if (operand.value === null) {
        return ExpressionType.NULL
      } else if (typeof operand.value === 'boolean') {
        return ExpressionType.BOOLEAN
      } else if (typeof operand.value === 'number') {
        return ExpressionType.NUMBER
      } else if (typeof operand.value === 'string') {
        return ExpressionType.TEXT
      }
    }
    throw new Error('Operand type is not supported')
  }

  private static getNotValueOrThrow(notValue: boolean|undefined, expressionType: ExpressionType): boolean {
    if (notValue === true) {
      if (expressionType === ExpressionType.BOOLEAN) {
        return true
      } else {
        throw new Error('You can not use "NOT" modifier unless expression type is boolean')
      }
    } else {
      return false
    }
  }
}
