'use strict'

export class Database {
  private readonly version: number
  private readonly tables: Table[]

  constructor(tables: Table[], version: number) {
    this.tables = tables
    this.version = version
  }

  getVersion(): number {
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

  getColumns() {
    return this.columns
  }

  public toString() {
    return this.tableName
  }
}

export class Column {
  private readonly columnName: string

  constructor(columnName: string) {
    this.columnName = columnName
  }

  public isEqual(value: string): Condition {
    return new Condition(this, Qualifier.Equal, value)
  }

  public toString() {
    return this.columnName
  }
}

export class Condition {
  private readonly column: Column
  private readonly qualifier: Qualifier
  private readonly value: string

  constructor(column: Column, qualifier: Qualifier, value: string) {
    this.column = column
    this.qualifier = qualifier
    this.value = value
  }

  public toString() {
    return `${this.column} ${this.qualifier} ${this.value}`
  }
}

enum Qualifier {
    Equal = '=',
}
