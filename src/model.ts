export class Database {
  private readonly version?: number
  //TODO: add engine
  // private readonly engin?: EngineEnum
  private readonly tables: Table[]

  //TODO: add engine
  constructor(tables: Table[], version?: number) {
    this.tables = tables
    this.version = version
  }

  getVersion(): number|undefined {
    return this.version
  }

  //TODO: add engine
  // getEngine(): EngineEnum|undefined {
  //   return this.engin
  // }
}

//TODO: add engine
// enum EngineEnum {
//   SQL_92,
//   POSTGRESQL,
// }

export class Table {
  private readonly tableName: string
  private readonly columns: Column[]

  constructor(tableName: string, columns: Column[]) {
    this.tableName = tableName
    this.columns = columns
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

export class TextColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: string|null|TextColumn): Condition   {
    const qualifier = value === null ? Qualifier.Is : Qualifier.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }
}

export class NumberColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(col1: NumberColumn, arOp: ArithmeticOperator, col2: NumberColumn): Condition
  public eq(value: number|null|NumberColumn): Condition
  public eq(value: number|null|NumberColumn, arOp?: ArithmeticOperator, col2?: NumberColumn): Condition {
    if (arOp === undefined && col2 === undefined) {
      const qualifier = value === null ? Qualifier.Is : Qualifier.Equal
      return new Condition(new Expression(this), qualifier, new Expression(value))
    } else if (arOp !== undefined && col2 !== undefined) {
      return new Condition(new Expression(this), Qualifier.Equal, new Expression(value, arOp, col2))
    }
    throw new Error('not supported case')
  }

  public gt(value: number): Condition
  public gt(value: NumberColumn): Condition
  public gt(value: number|NumberColumn): Condition {
    return new Condition(new Expression(this), Qualifier.GreaterThan, new Expression(value))
  }
}

export class Condition {
  private readonly left: Expression
  private readonly qualifier: Qualifier
  private readonly right: Expression

  constructor(left: Expression, qualifier: Qualifier, right: Expression) {
    // TODO: validate if qualifier is valid for the "right" type, for example Greater or Lesser does not work with string
    this.left = left
    this.qualifier = qualifier
    this.right = right
  }

  public toString() {
    return `${this.left} ${this.qualifier} ${this.right}`
  }
}

//TODO: include other value type like boolean
type NumberLike = number|NumberColumn
type TextLike = string|TextColumn
type ValueType = null|TextLike|NumberLike

export enum ArithmeticOperator {
  ADD = '+',
  SUB = '-',
}

export class Expression {
  public readonly value1: ValueType|Expression
  public readonly arOp?: ArithmeticOperator
  public readonly value2?: ValueType|Expression
  public readonly type: ExpressionType

  constructor(value1: ValueType|Expression)
  constructor(value1: ValueType|Expression, arOp: ArithmeticOperator, value2: ValueType|Expression)
  constructor(value1: ValueType|Expression, arOp?: ArithmeticOperator, value2?: ValueType|Expression) {
    this.value1 = value1
    this.arOp = arOp
    this.value2 = value2
    if (arOp !== undefined)
      this.type = ExpressionType.Complex
    else
      this.type = ExpressionType.Single
  }

  public toString(): string {
    let result = Expression.getValueString(this.value1)
    if (this.arOp !== undefined && this.value2 !== undefined) {
      result += ` ${this.arOp.toString()} ${Expression.getValueString(this.value2)}`
    }
    return result
  }

  private static getValueString(value: ValueType|Expression): string {
    if (value === null)
      return 'NULL'
    else if (typeof value === 'string')
      return `'${value}'` //todo: escape single quote
    else
      return value.toString()
  }
}

enum ExpressionType {
  Single = 'single',
  Complex = 'complex',
}

enum Qualifier {
  Equal = '=',
  // TODO: add "in" Qualifier
  // In = 'IN',
  Is = 'IS',
  // TODO: add other Qualifier for number
  GreaterThan = '>',
  // GreaterOrEqual = '>=',
  // Lesser = '<',
  // LesserOrEqual = '<=',
}
