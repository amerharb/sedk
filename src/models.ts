import { InvalidExpressionError } from './errors'
import { Binder } from './binder'
import { PrimitiveType } from './steps/steps'
import { Column, BooleanColumn, NumberColumn, TextColumn } from './columns'
import {
  NullOperator,
  ComparisonOperator,
  ArithmeticOperator,
  TextOperator,
  Operator,
  Qualifier,
} from './operators'
import { SelectItemInfo } from './select'
import { BuilderData } from './builder'
import { AggregateFunction } from './aggregateFunction'

export class Condition implements Expression {
  public readonly leftExpression: Expression
  public readonly operator?: Qualifier
  public readonly rightExpression?: Expression

  //Implement Expression
  public readonly leftOperand: Operand
  public readonly rightOperand?: Operand
  public readonly type: ExpressionType = ExpressionType.BOOLEAN

  constructor(leftExpression: Expression)
  constructor(leftExpression: Expression, operator: Qualifier, rightExpression: Expression)
  constructor(leftExpression: Expression, operator: Qualifier, rightExpression: Expression, notLeft: boolean, notRight: boolean)
  constructor(leftExpression: Expression, operator?: Qualifier, rightExpression?: Expression, notLeft?: boolean, notRight?: boolean) {
    this.leftOperand = new Operand(leftExpression, notLeft)
    this.operator = operator
    this.rightOperand = new Operand(rightExpression, notRight)
    this.type = ExpressionType.BOOLEAN
    this.leftExpression = leftExpression
    this.rightExpression = rightExpression
  }

  public getStmt(data: BuilderData): string {
    if (this.operator !== undefined && this.rightOperand !== undefined)
      return `${this.leftOperand.getStmt(data)} ${this.operator} ${this.rightOperand.getStmt(data)}`
    else
      return this.leftOperand.getStmt(data)
  }

  public as(alias: string): SelectItemInfo {
    return new SelectItemInfo(this, alias)
  }

  public getColumns(): Column[] {
    const columns: Column[] = []
    columns.push(...this.leftExpression.getColumns())
    if (this.rightExpression !== undefined)
      columns.push(...this.rightExpression.getColumns())

    return columns
  }
}

//TODO: include other value type like date-time
export type BooleanLike = boolean|BooleanColumn
export type NumberLike = number|NumberColumn
export type TextLike = string|TextColumn
export type ValueType = null|BooleanLike|NumberLike|TextLike
export type OperandType = ValueType|AggregateFunction|Expression

const booleanArray: readonly string[] = ['t', 'tr', 'tru', 'true', 'f', 'fa', 'fal', 'fals', 'false']
type TextBooleanSmallLetter = typeof booleanArray[number]
export type TextBoolean = TextBooleanSmallLetter|Capitalize<TextBooleanSmallLetter>|Uppercase<TextBooleanSmallLetter>

export function isTextBoolean(text: unknown): text is TextBoolean {
  if (typeof text === 'string')
    return booleanArray.includes(text)
  return false
}

export function isTextNumber(text: unknown): text is number {
  if (typeof text === 'string') {
    const numberRegex = /^-?[0-9]+(\.[0-9]+)?$/
    return numberRegex.test(text)
  }
  return false
}

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
    } else {
      return `${this.isNot ? 'NOT ' : ''}${this.value}`
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

export class Expression {
  public readonly leftOperand: Operand
  public readonly operator?: Operator
  public readonly rightOperand?: Operand
  public readonly type: ExpressionType

  constructor(binder: Binder)
  constructor(leftOperandType: OperandType)
  constructor(leftOperandType: OperandType, notLeft: boolean)
  constructor(leftOperandType: OperandType, operator: Operator, rightOperandType: OperandType)
  constructor(leftOperandType: OperandType, operator: Operator, rightOperandType: OperandType, notLeft: boolean, notRight: boolean)
  constructor(leftOperandType: OperandType|Binder, operatorOrNotLeft?: boolean|Operator, rightOperandType?: OperandType, notLeft?: boolean, notRight?: boolean) {
    if (typeof operatorOrNotLeft === 'boolean') {
      this.leftOperand = new Operand(leftOperandType, operatorOrNotLeft)
      this.operator = undefined
    } else {
      this.leftOperand = new Operand(leftOperandType, notLeft)
      this.operator = operatorOrNotLeft
    }

    this.rightOperand = new Operand(rightOperandType, notRight)

    if (this.rightOperand.type === ExpressionType.NOT_EXIST) {
      this.type = this.leftOperand.type
    } else if (typeof operatorOrNotLeft !== 'boolean' && operatorOrNotLeft !== undefined) {
      this.type = Expression.getResultExpressionType(this.leftOperand, operatorOrNotLeft, this.rightOperand)
    } else {
      throw new Error('Error while calculate Expression Type, failed to create object Expression')
    }
  }

  public getStmt(
    data: BuilderData,
    option: { withOuterBracket: boolean } = { withOuterBracket: true },
  ): string {
    if (this.operator !== undefined && this.rightOperand !== undefined) {
      const stmt = `${this.leftOperand.getStmt(data)} ${this.operator.toString()} ${this.rightOperand.getStmt(data)}`
      if (option.withOuterBracket)
        return `(${stmt})`
      return stmt
    }
    return this.leftOperand.getStmt(data)
  }

  public as(alias: string): SelectItemInfo {
    return new SelectItemInfo(this, alias)
  }

  public getColumns(): Column[] {
    const columns: Column[] = []

    const left = this.leftOperand.value
    if (left instanceof Column)
      columns.push(left)
    else if (left instanceof Expression)
      columns.push(...left.getColumns())

    const right = this.rightOperand?.value
    if (right instanceof Column)
      columns.push(right)
    else if (right instanceof Expression)
      columns.push(...right.getColumns())

    return columns
  }

  private static getResultExpressionType(left: Operand, operator: Operator, right: Operand): ExpressionType {
    if (this.isArithmeticOperator(operator)) {
      if ((left.type === ExpressionType.NULL && right.type === ExpressionType.NUMBER)
        || (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NULL))
        return ExpressionType.NULL

      if (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NUMBER)
        return ExpressionType.NUMBER

      if (((left.type === ExpressionType.TEXT && isTextNumber(left.value)) && right.type === ExpressionType.NUMBER)
        || (left.type === ExpressionType.NUMBER && (right.type === ExpressionType.TEXT && isTextNumber(right.value))))
        return ExpressionType.NUMBER

      this.throwInvalidTypeError(left.type, operator, right.type)
    }

    if (this.isBooleanOperator(operator)) {
      if (left.type === ExpressionType.NULL || right.type === ExpressionType.NULL)
        return ExpressionType.NULL

      if (left.type === right.type)
        return ExpressionType.BOOLEAN

      if (left.type === ExpressionType.BOOLEAN && (right.type === ExpressionType.TEXT && isTextBoolean(right.value))
        || right.type === ExpressionType.BOOLEAN && (left.type === ExpressionType.TEXT && isTextBoolean(left.value)))
        return ExpressionType.BOOLEAN

      if (left.type === ExpressionType.NUMBER && (right.type === ExpressionType.TEXT && isTextNumber(right.value))
        || right.type === ExpressionType.NUMBER && (left.type === ExpressionType.TEXT && isTextNumber(left.value)))
        return ExpressionType.BOOLEAN

      this.throwInvalidTypeError(left.type, operator, right.type)
    }

    if (this.isNullOperator(operator)) {
      if (right.type === ExpressionType.NULL)
        return ExpressionType.BOOLEAN

      if (right.type === ExpressionType.BOOLEAN) {
        if (left.type === ExpressionType.NULL || ExpressionType.BOOLEAN)
          return ExpressionType.BOOLEAN
        if (left.type === ExpressionType.TEXT && isTextNumber(left.value))
          return ExpressionType.BOOLEAN
      }

      this.throwInvalidTypeError(left.type, operator, right.type)
    }

    if (this.isTextOperator(operator)) {
      if (left.type === ExpressionType.NULL || right.type === ExpressionType.NULL)
        return ExpressionType.NULL

      if (left.type === ExpressionType.TEXT
        && (right.type === ExpressionType.TEXT || right.type === ExpressionType.NUMBER))
        return ExpressionType.TEXT

      if (left.type === ExpressionType.NUMBER && right.type === ExpressionType.TEXT)
        return ExpressionType.TEXT

      this.throwInvalidTypeError(left.type, operator, right.type)
    }

    throw new Error(`Function "getResultExpressionType" does not support operator: "${operator}"`)
  }

  private static isArithmeticOperator(operator: Operator): boolean {
    return Object.values(ArithmeticOperator).includes(operator as ArithmeticOperator)
  }

  private static isTextOperator(operator: Operator): boolean {
    return Object.values(TextOperator).includes(operator as TextOperator)
  }

  private static isBooleanOperator(operator: Operator): boolean {
    return Object.values(ComparisonOperator).includes(operator as ComparisonOperator)
  }

  private static isNullOperator(operator: Operator): boolean {
    return Object.values(NullOperator).includes(operator as NullOperator)
  }

  private static throwInvalidTypeError(leftType: ExpressionType, operator: Operator, rightType: ExpressionType): never {
    throw new InvalidExpressionError(`You can not have "${ExpressionType[leftType]}" and "${ExpressionType[rightType]}" with operator "${operator}"`)
  }
}

export enum ExpressionType {
  NOT_EXIST,
  NULL,
  BOOLEAN,
  NUMBER,
  TEXT,
}

export type PostgresBinder = {
  sql: string,
  values: PrimitiveType[]
}
