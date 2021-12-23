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

  public eq(value: string|null): Condition {
    if (value === null)
      return new Condition(this, Qualifier.Is, value)
    else
      return new Condition(this, Qualifier.Equal, value)
  }
}

export class NumberColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: number|null): Condition {
    if (value === null)
      return new Condition(this, Qualifier.Is, value)
    else
      return new Condition(this, Qualifier.Equal, value)
  }
}

export class Condition {
  private readonly column: Column
  private readonly qualifier: Qualifier
  private readonly value: string|number|null

  constructor(column: Column, qualifier: Qualifier, value: string|number|null) {
    // TODO: validate if qualifier is valid for the value type, for example Greater or Lesser does not work with string
    this.column = column
    this.qualifier = qualifier
    this.value = value
  }

  public toString() {
    if (this.column instanceof TextColumn) {
      if (typeof this.value === 'string') {
        /**
         * TODO: escape single quote if they inside value dependce ondb enginge
         * for example PostgreSQL way of escape is repeat the single qoute so for "I can't" -> 'I can''t'
         * so using .replaceAll("'","''") should do the job
         */
        return `${this.column} ${this.qualifier} '${this.value}'`
      } else if (this.value === null) {
        //TODO: check if we need to check if qualifier in this case should be only "IS" or not
        return `${this.column} ${this.qualifier} NULL`
      } else { // value is number
        throw new Error('TextColumn can not be validate with number value')
      }
    } else if (this.column instanceof NumberColumn) {
      if (typeof this.value === 'number') {
        return `${this.column} ${this.qualifier} ${this.value}`
      } else if (this.value === null) {
        //TODO: check if we need to check if qualifier in this case should be only "IS" or not
        return `${this.column} ${this.qualifier} NULL`
      } else { // value is string
        throw new Error('NumberColumn can not be validate with string value')
      }
    }
    throw new Error('Column type is not supported')
  }
}

enum Qualifier {
    Equal = '=',
    // TODO: add "in" Qualifier
    // In = 'IN',
    Is = 'IS',
    // TODO: add other Qualifier for number
    // Greater = '>',
    // GreaterOrEqual = '>=',
    // Lesser = '<',
    // LesserOrEqual = '<=',
}
