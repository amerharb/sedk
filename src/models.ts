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
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: null|BooleanLike): Condition {
    const qualifier = value === null ? Qualifier.Is : Qualifier.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|boolean): Condition {
    const qualifier = value === null ? Qualifier.Is : Qualifier.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public not(): Condition {
    return new Condition(new Expression(this, true))
  }

  // implement Condition
  public readonly left: Expression = new Condition(this)
  public readonly leftType: ExpressionType = ExpressionType.BOOLEAN
  public readonly notLeft: boolean = false
  public readonly notRight: boolean = false
  public readonly resultType: ExpressionType = ExpressionType.BOOLEAN
  public readonly rightType: ExpressionType = ExpressionType.NOT_EXIST
}

export class NumberColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: null|NumberLike): Condition
  public eq(value1: NumberLike, op: Operator, value2: NumberLike): Condition
  public eq(value1: null|NumberLike, op?: Operator, value2?: NumberLike): Condition {
    if (op === undefined && value2 === undefined) {
      const qualifier = value1 === null ? Qualifier.Is : Qualifier.Equal
      return new Condition(new Expression(this), qualifier, new Expression(value1))
    } else if (op !== undefined && value2 !== undefined) {
      return new Condition(new Expression(this), Qualifier.Equal, new Expression(value1, op, value2))
    }
    throw new Error('not supported case')
  }

  public eq$(value: null|number): Condition {
    const qualifier = value === null ? Qualifier.Is : Qualifier.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public gt(value: NumberLike): Condition {
    return new Condition(new Expression(this), Qualifier.GreaterThan, new Expression(value))
  }

  public gt$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), Qualifier.GreaterThan, new Expression(binder))
  }
}

export class TextColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: Expression): Condition
  public eq(value: null|string|TextColumn): Condition
  public eq(value: null|string|TextColumn|Expression): Condition {
    const qualifier = value === null ? Qualifier.Is : Qualifier.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|string): Condition {
    const qualifier = value === null ? Qualifier.Is : Qualifier.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public concat(value: TextLike): Expression {
    return new Expression(this, TextOperator.CONCAT, value)
  }
}

export class Condition implements Expression {
  public readonly left: Expression
  public readonly qualifier?: Qualifier
  public readonly right?: Expression

  public readonly operator?: Operator
  public readonly leftType: ExpressionType
  public readonly rightType: ExpressionType
  public readonly resultType: ExpressionType
  public readonly notLeft: boolean
  public readonly notRight: boolean

  constructor(left: Expression)
  constructor(left: Expression, qualifier: Qualifier, right: Expression)
  constructor(left: Expression, qualifier: Qualifier, right: Expression, notLeft: boolean, notRight: boolean)
  constructor(left: Expression, qualifier?: Qualifier, right?: Expression, notLeft?: boolean, notRight?: boolean) {
    // TODO: validate if qualifier is valid for the "right" type, for example Greater or Lesser does not work with string
    this.left = left
    this.qualifier = qualifier
    this.right = right

    this.leftType = left.resultType
    this.resultType = ExpressionType.BOOLEAN
    this.notLeft = getNotValueOrThrow(notLeft, left.resultType)
    if (qualifier === undefined && right === undefined && left.resultType === ExpressionType.BOOLEAN) {
      this.operator = undefined
      this.rightType = ExpressionType.NOT_EXIST
      this.notRight = false
    } else if (qualifier !== undefined && right !== undefined) {
      this.operator = Condition.getOperatorFromQualifier(qualifier)
      this.rightType = right.resultType
      this.notRight = getNotValueOrThrow(notRight, right.resultType)
    }
  }

  private static getOperatorFromQualifier(qualifier: Qualifier): Operator {
    switch (qualifier) {
    case Qualifier.Equal:
      return BooleanOperator.Equal
    case Qualifier.Is:
      return NullOperator.Is
    case Qualifier.GreaterThan:
      return BooleanOperator.GreaterThan
    }
  }

  public toString(): string {
    if (this.qualifier !== undefined && this.right !== undefined)
      return `${this.left} ${this.qualifier} ${this.right}`
    else
      return this.left.toString()
  }

}

//TODO: include other value type like date-time
type BooleanLike = boolean|BooleanColumn
type NumberLike = number|NumberColumn
type TextLike = string|TextColumn
type ValueType = null|BooleanLike|NumberLike|TextLike
export type OperandType = ValueType|Expression

function getNotValueOrThrow(notValue: boolean|undefined, expressionType: ExpressionType): boolean {
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

export class Expression {
  public readonly left: OperandType|Binder
  public readonly operator?: Operator
  public readonly right?: OperandType
  public readonly leftType: ExpressionType
  public readonly rightType: ExpressionType
  public readonly resultType: ExpressionType
  public readonly notLeft: boolean
  public readonly notRight: boolean

  constructor(binder: Binder)
  constructor(left: OperandType)
  constructor(left: OperandType, notLeft: boolean)
  constructor(left: OperandType, operator: Operator, right: OperandType)
  constructor(left: OperandType, operator: Operator, right: OperandType, notLeft: boolean, notRight: boolean)
  constructor(left: OperandType|Binder, operatorOrNotLeft?: boolean|Operator, right?: OperandType, notLeft?: boolean, notRight?: boolean) {
    // TODO: validate Expression, for example if left and right are string they can not be used with + and -
    this.left = left
    this.leftType = Expression.getExpressionType(left)
    if (typeof operatorOrNotLeft !== 'boolean') {
      this.operator = operatorOrNotLeft
      this.notLeft = getNotValueOrThrow(notLeft, this.leftType)
    } else {
      this.operator = undefined
      this.notLeft = getNotValueOrThrow(operatorOrNotLeft, this.leftType)
    }
    this.right = right

    if (right === undefined) {
      this.rightType = ExpressionType.NOT_EXIST
      this.resultType = this.leftType
    } else if (typeof operatorOrNotLeft !== 'boolean' && operatorOrNotLeft !== undefined) {
      this.rightType = Expression.getExpressionType(right)
      this.resultType = Expression.getResultExpressionType(this.leftType, operatorOrNotLeft, this.rightType)
    }

    this.notRight = getNotValueOrThrow(notRight, this.rightType)
  }

  public toString(): string {
    if (this.operator !== undefined && this.right !== undefined) {
      return `(${Expression.getOperandString(this.left, this.notLeft)} ${this.operator.toString()} ${Expression.getOperandString(this.right, this.notRight)})`
    }
    return Expression.getOperandString(this.left, this.notLeft)
  }

  private static getExpressionType(operand: OperandType|Binder): ExpressionType {
    if (operand === null) {
      return ExpressionType.NULL
    } else if (operand instanceof Expression) {
      return operand.resultType
    } else if (operand instanceof Binder) {
      return ExpressionType.BINDER
    } else if (typeof operand === 'boolean' || operand instanceof BooleanColumn) {
      return ExpressionType.BOOLEAN
    } else if (typeof operand === 'number' || operand instanceof NumberColumn) {
      return ExpressionType.NUMBER
    } else if (typeof operand === 'string' || operand instanceof TextColumn) {
      return ExpressionType.TEXT
    }
    throw new Error('Operand type is not supported')
  }

  private static getResultExpressionType(left: ExpressionType, operator: Operator, right: ExpressionType): ExpressionType {
    if (this.isArithmeticOperator(operator)) {
      if ((left === ExpressionType.NULL && right === ExpressionType.NUMBER)
        || (left === ExpressionType.NUMBER && right === ExpressionType.NULL))
        return ExpressionType.NULL

      if (left === ExpressionType.NUMBER && right === ExpressionType.NUMBER)
        return ExpressionType.NUMBER

      this.throwInvalidTypeError(left, operator, right)

    } else if (this.isBooleanOperator(operator)) {
      if (left === ExpressionType.NULL || right === ExpressionType.NULL)
        return ExpressionType.NULL

      if (left === right)
        return ExpressionType.BOOLEAN

      //TODO: support the case when TEXT is convertable to boolean or number
      this.throwInvalidTypeError(left, operator, right)

    } else if (this.isNullOperator(operator)) {
      if (right === ExpressionType.NULL)
        return ExpressionType.BOOLEAN

      if (right === ExpressionType.BOOLEAN) {
        if (left === ExpressionType.BOOLEAN)
          return ExpressionType.BOOLEAN
        if (left === ExpressionType.TEXT) //TODO: support the case when left is boolean and right is literal TRUE or FALSE
          this.throwInvalidTypeError(left, operator, right) //todo check text value
      }

      this.throwInvalidTypeError(left, operator, right)

    } else if (this.isTextOperator(operator)) {
      if (left === ExpressionType.NULL || right === ExpressionType.NULL)
        return ExpressionType.NULL

      if (left === ExpressionType.TEXT && (right === ExpressionType.TEXT || right === ExpressionType.NUMBER))
        return ExpressionType.TEXT

      if (left === ExpressionType.NUMBER && right === ExpressionType.TEXT)
        return ExpressionType.TEXT

      this.throwInvalidTypeError(left, operator, right)
    } else {
      throw new Error(`Function "getResultExpressionType" does not support operator: "${operator}"`)
    }
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

  private static throwInvalidTypeError(left: ExpressionType, operator: Operator, right: ExpressionType): never {
    throw new InvalidExpressionError(`You can not have "${ExpressionType[left]}" and "${ExpressionType[right]}" with operator "${operator}"`)
  }

  private static getOperandString(value: OperandType|Binder, isNot: boolean): string {
    if (value === null) {
      return 'NULL'
    } else if (value instanceof Binder) {
      return `$${value.no}`
    } else if (typeof value === 'string') {
      // escape single quote by repeating it
      const result = value.replace(/'/g, '\'\'')
      return `'${result}'`
    } else if (typeof value === 'boolean') {
      return `${isNot ? 'NOT ' : ''}${value ? 'TRUE' : 'FALSE'}`
    } else {
      return `${isNot ? 'NOT ' : ''}${value}`
    }
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

/*
Remember to redefine everything in Qualifier enum again in LogicalOperator enum.
currently, we can not read from the same source as we can't have computed string value in enum
there is an open issue for this: https://github.com/microsoft/TypeScript/issues/40793
 */
enum Qualifier { //Relational operator
  Equal = '=',
  // TODO: add "in" Qualifier
  // Like = 'like',
  // In = 'IN',
  Is = 'IS',
  // TODO: add other Qualifier for number
  GreaterThan = '>',
  // GreaterOrEqual = '>=',
  // Lesser = '<',
  // LesserOrEqual = '<=',
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

export type Operator = NullOperator|BooleanOperator|ArithmeticOperator|TextOperator

export type PostgresBinder = {
  sql: string,
  values: PrimitiveType[]
}
