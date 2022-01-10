export class Database {
  private readonly version?: number
  private readonly tables: Table[]

  constructor(tables: Table[], version?: number) {
    this.tables = tables
    this.version = version
  }

  getVersion(): number|undefined {
    return this.version
  }

  getTables(): Table[] {
    return this.tables
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

  protected constructor(columnName: string) {
    this.columnName = columnName
  }

  public toString() {
    return this.columnName
  }
}

export class BooleanColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: null|BooleanLike): Condition {
    return new Condition(new Expression(this), Qualifier.Is, new Expression(value))
  }
}

export class NumberColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value1: NumberLike, op: Operator, value2: NumberLike): Condition
  public eq(value: null|NumberLike): Condition
  public eq(value1: null|NumberLike, op?: Operator, value2?: NumberLike): Condition {
    if (op === undefined && value2 === undefined) {
      const qualifier = value1 === null ? Qualifier.Is : Qualifier.Equal
      return new Condition(new Expression(this), qualifier, new Expression(value1))
    } else if (op !== undefined && value2 !== undefined) {
      return new Condition(new Expression(this), Qualifier.Equal, new Expression(value1, op, value2))
    }
    throw new Error('not supported case')
  }

  public gt(value: NumberLike): Condition {
    return new Condition(new Expression(this), Qualifier.GreaterThan, new Expression(value))
  }
}

export class TextColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: string|null|TextColumn): Condition {
    const qualifier = value === null ? Qualifier.Is : Qualifier.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }
}

export class Condition implements Expression {
  public readonly left: Expression
  public readonly qualifier: Qualifier
  public readonly right: Expression

  public readonly operator: Operator
  public readonly leftType: ExpressionType
  public readonly RightType: ExpressionType
  public readonly resultType: ExpressionType

  constructor(left: Expression, qualifier: Qualifier, right: Expression) {
    // TODO: validate if qualifier is valid for the "right" type, for example Greater or Lesser does not work with string
    this.left = left
    this.qualifier = qualifier
    this.right = right

    this.operator = Condition.getOperatorFromQualifier(qualifier)
    this.leftType = left.resultType
    this.RightType = right.resultType
    this.resultType = ExpressionType.BOOLEAN
  }

  private static getOperatorFromQualifier(qualifier: Qualifier): Operator {
    switch (qualifier) {
    case Qualifier.Equal:
      return Operator.Equal
    case Qualifier.Is:
      return Operator.Is
    case Qualifier.GreaterThan:
      return Operator.GreaterThan
    }
  }

  public toString() {
    return `${this.left} ${this.qualifier} ${this.right}`
  }

}

//TODO: include other value type like date time
type BooleanLike = boolean|BooleanColumn
type NumberLike = number|NumberColumn
type TextLike = string|TextColumn
type ValueType = null|BooleanLike|NumberLike|TextLike
type OperandType = ValueType|Expression

export class Expression {
  public readonly left: OperandType
  public readonly operator?: Operator
  public readonly right?: OperandType
  public readonly leftType: ExpressionType
  public readonly RightType: ExpressionType
  public readonly resultType: ExpressionType

  constructor(left: OperandType)
  constructor(left: OperandType, operator: Operator, right: OperandType)
  constructor(left: OperandType, operator?: Operator, right?: OperandType) {
    // TODO: validate Expression, for example if left and right are string they can not be used with + and -
    this.left = left
    this.operator = operator
    this.right = right
    this.leftType = Expression.getExpressionType(left)

    if (right === undefined) {
      this.RightType = ExpressionType.NOT_DEFINED
      this.resultType = this.leftType
    } else if (operator !== undefined) {
      this.RightType = Expression.getExpressionType(right)
      this.resultType = Expression.getResultExpressionType(this.leftType, operator, this.RightType)
    }
  }

  public toString(): string {
    let result = Expression.getValueString(this.left)
    if (this.operator !== undefined && this.right !== undefined) {
      result += ` ${this.operator.toString()} ${Expression.getValueString(this.right)}`
    }
    return result
  }

  private static getExpressionType(operand: OperandType): ExpressionType {
    if (operand === null) {
      return ExpressionType.NULL
    } else if (operand instanceof Expression) {
      return operand.resultType
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
    if (operator === Operator.ADD || operator === Operator.SUB) {
      if ((left === ExpressionType.NULL && right === ExpressionType.NUMBER)
        || (left === ExpressionType.NUMBER && right === ExpressionType.NULL))
        return ExpressionType.NULL

      if (left === ExpressionType.NUMBER && right === ExpressionType.NUMBER)
        return ExpressionType.NUMBER

      throw new Error(`You can not have "${left}" and "${right}" in Arithmetic operator ${operator}`)
    } else {
      throw new Error(`Function "getResultExpressionType" does not support operator: "${operator}"`)
    }
  }

  private static getValueString(value: OperandType): string {
    if (value === null) {
      return 'NULL'
    } else if (typeof value === 'string') {
      // escape single quote by repeating it
      const result = value.replace(/'/g, '\'\'')
      return `'${result}'`
    } else {
      return value.toString()
    }
  }
}

enum ExpressionType {NOT_DEFINED, NULL, BOOLEAN, NUMBER, TEXT}

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

export enum Operator {
  ADD = '+',
  SUB = '-',

  //All Qualifier Enum Copied Manually
  Equal = '=',
  Is = 'IS',
  GreaterThan = '>',
}
