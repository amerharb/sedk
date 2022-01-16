import { InvalidExpressionError } from './errors'
import { BinderStore, Binder, PrimitiveType } from './binder'

export class Database {
  private readonly version?: number
  private readonly tables: Table[]

  constructor(tables: Table[], version?: number) {
    this.tables = tables
    this.version = version
  }

  public getVersion(): number|undefined {
    return this.version
  }

  public getTables(): Table[] {
    return this.tables
  }

  public isTableExist(table: Table): boolean {
    let found = false
    for (const t of this.tables) {
      if (table === t) {
        found = true
        break
      }
    }
    return found
  }
}

export class Table {
  private readonly tableName: string
  private readonly columns: Column[]

  constructor(tableName: string, columns: Column[]) {
    this.tableName = tableName
    this.columns = columns
  }

  public getColumn() {
    return this.columns
  }

  public toString() {
    return this.tableName
  }
}

export abstract class Column {
  protected readonly columnName: string
  protected readonly binderStore = BinderStore.getInstance()

  protected constructor(columnName: string) {
    this.columnName = columnName
  }

  public toString() {
    return this.columnName
  }
}

export class BooleanColumn extends Column implements Condition {
  // implement Condition
  public readonly leftExpression: Expression = new Expression(this)
  public readonly leftOperand: Operand = this.leftExpression.leftOperand
  public readonly type: ExpressionType = ExpressionType.BOOLEAN

  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: null|BooleanLike): Condition {
    const qualifier = value === null ? NullOperator.Is : BooleanOperator.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|boolean): Condition {
    const qualifier = value === null ? NullOperator.Is : BooleanOperator.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public not(): Condition {
    return new Condition(new Expression(this, true))
  }
}

export class NumberColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: null|NumberLike): Condition
  public eq(value1: NumberLike, op: Operator, value2: NumberLike): Condition
  public eq(value1: null|NumberLike, op?: Operator, value2?: NumberLike): Condition {
    if (op === undefined && value2 === undefined) {
      const qualifier = value1 === null ? NullOperator.Is : BooleanOperator.Equal
      return new Condition(new Expression(this), qualifier, new Expression(value1))
    } else if (op !== undefined && value2 !== undefined) {
      return new Condition(new Expression(this), BooleanOperator.Equal, new Expression(value1, op, value2))
    }
    throw new Error('not supported case')
  }

  public eq$(value: null|number): Condition {
    const qualifier = value === null ? NullOperator.Is : BooleanOperator.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public gt(value: NumberLike): Condition {
    return new Condition(new Expression(this), BooleanOperator.GreaterThan, new Expression(value))
  }

  public gt$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), BooleanOperator.GreaterThan, new Expression(binder))
  }
}

export class TextColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: Expression): Condition
  public eq(value: null|string|TextColumn): Condition
  public eq(value: null|string|TextColumn|Expression): Condition {
    const qualifier = value === null ? NullOperator.Is : BooleanOperator.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|string): Condition {
    const qualifier = value === null ? NullOperator.Is : BooleanOperator.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public concat(value: TextLike): Expression {
    return new Expression(this, TextOperator.CONCAT, value)
  }
}

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
    // TODO: validate if qualifier is valid for the "rightOperand" type, for example Greater or Lesser does not work with string
    this.leftOperand = new Operand(leftExpression, notLeft)
    this.operator = operator
    this.rightOperand = new Operand(rightExpression, notRight)
    this.type = ExpressionType.BOOLEAN
    this.leftExpression = leftExpression
    this.rightExpression = rightExpression
  }

  public toString(): string {
    if (this.operator !== undefined && this.rightOperand !== undefined)
      return `${this.leftOperand} ${this.operator} ${this.rightOperand}`
    else
      return this.leftOperand.toString()
  }
}

//TODO: include other value type like date-time
export type BooleanLike = boolean|BooleanColumn
export type NumberLike = number|NumberColumn
export type TextLike = string|TextColumn
export type ValueType = null|BooleanLike|NumberLike|TextLike
export type OperandType = ValueType|Expression

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

class Operand {
  public value?: OperandType|Binder
  public type: ExpressionType
  public isNot: boolean

  constructor(value?: OperandType|Binder, isNot?: boolean) {
    this.value = value
    this.type = Operand.getExpressionType(value)
    this.isNot = Operand.getNotValueOrThrow(isNot, this.type)
  }

  public toString(): string {
    if (this.value === null) {
      return 'NULL'
    } else if (this.value instanceof Binder) {
      return `$${this.value.no}`
    } else if (typeof this.value === 'string') {
      // escape single quote by repeating it
      const result = this.value.replace(/'/g, '\'\'')
      return `'${result}'`
    } else if (typeof this.value === 'boolean') {
      return `${this.isNot ? 'NOT ' : ''}${this.value ? 'TRUE' : 'FALSE'}`
    } else {
      return `${this.isNot ? 'NOT ' : ''}${this.value}`
    }
  }

  private static getExpressionType(operandType?: OperandType|Binder): ExpressionType {
    if (operandType === undefined) {
      return ExpressionType.NOT_EXIST
    } else if (operandType === null) {
      return ExpressionType.NULL
    } else if (operandType instanceof Expression) {
      return operandType.type
    } else if (operandType instanceof Binder) {
      return ExpressionType.BINDER
    } else if (typeof operandType === 'boolean' || operandType instanceof BooleanColumn) {
      return ExpressionType.BOOLEAN
    } else if (typeof operandType === 'number' || operandType instanceof NumberColumn) {
      return ExpressionType.NUMBER
    } else if (typeof operandType === 'string' || operandType instanceof TextColumn) {
      return ExpressionType.TEXT
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
    // TODO: validate Expression, for example if leftOperand and rightOperand are string they can not be used with + and -
    if (typeof operatorOrNotLeft === 'boolean')
      this.leftOperand = new Operand(leftOperandType, operatorOrNotLeft)
    else
      this.leftOperand = new Operand(leftOperandType, notLeft)

    if (typeof operatorOrNotLeft !== 'boolean') {
      this.operator = operatorOrNotLeft
    } else {
      this.operator = undefined
    }
    this.rightOperand = new Operand(rightOperandType, notRight)

    if (this.rightOperand.type === ExpressionType.NOT_EXIST) {
      this.type = this.leftOperand.type
    } else if (typeof operatorOrNotLeft !== 'boolean' && operatorOrNotLeft !== undefined) {
      this.type = Expression.getResultExpressionType(this.leftOperand, operatorOrNotLeft, this.rightOperand)
    }
  }

  public toString(): string {
    if (this.operator !== undefined && this.rightOperand !== undefined) {
      return `(${this.leftOperand} ${this.operator.toString()} ${this.rightOperand})`
    }
    return this.leftOperand.toString()
  }

  private static getResultExpressionType(left: Operand, operator: Operator, right: Operand): ExpressionType {
    if (this.isArithmeticOperator(operator)) {
      if ((left.type === ExpressionType.NULL && right.type === ExpressionType.NUMBER)
        || (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NULL))
        return ExpressionType.NULL

      if (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NUMBER)
        return ExpressionType.NUMBER

      if ((left.type === ExpressionType.TEXT && right.type === ExpressionType.NUMBER)
        || (left.type === ExpressionType.NUMBER && right.type === ExpressionType.TEXT))
        this.throwInvalidTypeError(left.type, operator, right.type) //TODO: support case when text is convertable to number

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
    return Object.values(BooleanOperator).includes(operator as BooleanOperator)
  }

  private static isNullOperator(operator: Operator): boolean {
    return Object.values(NullOperator).includes(operator as NullOperator)
  }

  private static throwInvalidTypeError(leftType: ExpressionType, operator: Operator, rightType: ExpressionType): never {
    throw new InvalidExpressionError(`You can not have "${ExpressionType[leftType]}" and "${ExpressionType[rightType]}" with operator "${operator}"`)
  }
}

enum ExpressionType {
  NOT_EXIST,
  NULL,
  BOOLEAN,
  NUMBER,
  TEXT,
  BINDER,
}

// TODO: add other arithmetic operators
export enum ArithmeticOperator {
  ADD = '+',
  SUB = '-',
}

export enum TextOperator {
  CONCAT = '||',
}

// TODO: add other comparison operators
export enum BooleanOperator {
  Equal = '=',
  GreaterThan = '>',
}

export enum NullOperator {
  Is = 'IS',
}

export type Qualifier = NullOperator|BooleanOperator
export type Operator = NullOperator|BooleanOperator|ArithmeticOperator|TextOperator

export type PostgresBinder = {
  sql: string,
  values: PrimitiveType[]
}
