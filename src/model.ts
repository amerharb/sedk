'use strict'

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

  public eq(col1: TextColumn, arOp: ArithmeticOperator, col2: TextColumn): Condition
  public eq(value: string|null|TextColumn): Condition
  public eq(value: string|null|TextColumn, arOp?: ArithmeticOperator, col2?: TextColumn): Condition {
    if (value === null)
      return new Condition(this, Qualifier.Is, new Expression(null))
    else if (typeof value === 'string')
      return new Condition(this, Qualifier.Equal, new Expression(value))
    else { // TextColumn
      if (arOp === undefined && col2 === undefined) {
        return new Condition(this, Qualifier.Equal, new Expression(value))
      } else if (arOp !== undefined && col2 !== undefined) {
        return new Condition(this, Qualifier.Equal, new Expression(value, arOp, col2))
      }
    }
    throw new Error('invalid condition')
  }
}

export class NumberColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: number|null|NumberColumn): Condition {
    if (value === null)
      return new Condition(this, Qualifier.Is, new Expression(null))
    else if (typeof value === 'number')
      return new Condition(this, Qualifier.Equal, new Expression(value))
    else { //NumberColumn
      return new Condition(this, Qualifier.Equal, new Expression(value))
    }
  }

  public gt(value: number): Condition
  public gt(value: NumberColumn): Condition
  public gt(value: number|NumberColumn): Condition {
    return new Condition(this, Qualifier.GreaterThan, new Expression(value))
  }
}

export class Condition {
  private readonly column: Column
  private readonly qualifier: Qualifier
  private readonly value: Expression

  constructor(column: Column, qualifier: Qualifier, value: Expression) {
    // TODO: validate if qualifier is valid for the value type, for example Greater or Lesser does not work with string
    this.column = column
    this.qualifier = qualifier
    this.value = value
  }

  public toString() {
    if (this.column instanceof TextColumn) {
      if (this.value.type === ExpressionType.SINGLE) {
        if (typeof this.value.value1 === 'string') {
          /**
           * TODO: escape single quote if they inside value dependency on db engine
           * for example PostgreSQL way of escape is repeat the single quote so for "I can't" -> 'I can''t'
           * so using .replaceAll("'","''") should do the job
           */
          return `${this.column} ${this.qualifier} '${this.value}'`
        } else if (this.value.value1 === null) {
          //TODO: check if we need to check if qualifier in this case should be only "IS" or not
          return `${this.column} ${this.qualifier} NULL`
        } else if (this.value.value1 instanceof TextColumn) {
          return `${this.column} ${this.qualifier} ${this.value}`
        } else { // value is number
          throw new Error('TextColumn can not be validate with number value')
        }
      } else { //complex
        return `${this.column} ${this.qualifier} ${this.value}`
      }
    } else if (this.column instanceof NumberColumn) {
      if (this.value.type === ExpressionType.SINGLE) {
        if (typeof this.value.value1 === 'number') {
          return `${this.column} ${this.qualifier} ${this.value}`
        } else if (this.value.value1 === null) {
          //TODO: check if we need to check if qualifier in this case should be only "IS" or not
          return `${this.column} ${this.qualifier} NULL`
        } else if (this.value.value1 instanceof NumberColumn) {
          return `${this.column} ${this.qualifier} ${this.value}`
        } else { // value is string
          throw new Error('NumberColumn can not be validate with string value')
        }
      } else { //complex
        return `${this.column} ${this.qualifier} ${this.value}`
      }
    }
    throw new Error('Column type is not supported')
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
      this.type = ExpressionType.SINGLE
  }

  public toString(): string {
    if (this.arOp === undefined && this.value2 === undefined) {
      return this.value1 === null ? 'NULL' : this.value1.toString()
    } else if (this.arOp !== undefined && this.value2 !== undefined) {
      const p1 = this.value1 === null ? 'NULL' : this.value1.toString()
      const p2 = this.arOp.toString()
      const p3 = this.value2 === null ? 'NULL' : this.value2.toString()
      return `${p1} ${p2} ${p3}`
    }
    throw new Error('invalid Expression')
  }
}

enum ExpressionType {
  SINGLE = 'single',
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
