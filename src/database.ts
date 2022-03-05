import { BinderStore } from './binder'
import {
  BooleanLike,
  NumberLike,
  TextLike,
  Condition,
  Expression,
  Operand,
  ExpressionType,
} from './models'
import {
  NullOperator,
  ComparisonOperator,
  TextOperator,
  Operator,
} from './operators'
import {
  OrderByItemInfo,
  DIRECTION_NOT_EXIST,
  ASC,
  DESC,
  NULLS_POSITION_NOT_EXIST,
  NULLS_FIRST,
  NULLS_LAST,
} from './orderBy'
import { SelectItemInfo } from './select'
import { escapeDoubleQuote } from './util'

type SchemasObj = {
  [schemaName: string]: Schema
}

type DatabaseObj<S extends SchemasObj> = {
  version?: number
  schemas: S
}

export class Database<S extends SchemasObj = SchemasObj> {
  private readonly mSchemas: S
  private readonly schemaArray: readonly Schema[]

  constructor(private readonly data: DatabaseObj<S>) {
    this.mSchemas = data.schemas
    const schemaArray: Schema[] = []
    Object.values(data.schemas).forEach(it => {
      schemaArray.push(it)
      it.database = this
    })
    this.schemaArray = schemaArray
  }

  public get schemas(): S {
    return this.mSchemas
  }

  /** Alias to get schemas() */
  public get s(): S {
    return this.schemas
  }

  public isSchemaExist(schema: Schema): boolean {
    for (const s of this.schemaArray) {
      if (schema === s) {
        return true
      }
    }
    return false
  }

  public isTableExist(table: Table): boolean {
    for (const schema of this.schemaArray) {
      if (schema.isTableExist(table)) {
        return true
      }
    }
    return false
  }

  public isColumnExist(column: Column): boolean {
    for (const schema of this.schemaArray) {
      if (schema.isColumnExist(column)) {
        return true
      }
    }
    return false
  }
}

type TablesObj = {
  [tableName: string]: Table
}

type SchemaObj<T extends TablesObj> = {
  name?: string
  tables: T
}

export class Schema<T extends TablesObj = TablesObj> {
  private mDatabase?: Database
  private readonly mTables: T
  private readonly tableArray: readonly Table[]

  constructor(private readonly data: SchemaObj<T>) {
    this.mTables = data.tables
    const tableArray: Table[] = []
    Object.values(data.tables).forEach(it => {
      tableArray.push(it)
      it.schema = this
    })
    this.tableArray = tableArray
  }

  public set database(database: Database) {
    if (this.mDatabase === undefined)
      this.mDatabase = database
    else
      throw new Error('Database can only be assigned one time')
  }

  public get database(): Database {
    if (this.mDatabase === undefined)
      throw new Error('Database is undefined')

    return this.mDatabase
  }

  public get tables(): T {
    return this.mTables
  }

  /** Alias to get tables() */
  public get t(): T {
    return this.tables
  }

  public isTableExist(table: Table): boolean {
    for (const t of this.tableArray) {
      if (table === t) {
        return true
      }
    }
    return false
  }

  public isColumnExist(column: Column): boolean {
    for (const table of this.tableArray) {
      if (table.isColumnExist(column)) {
        return true
      }
    }
    return false
  }
}

type ColumnsObj = {
  [columnName: string]: Column
}

type TableObj<C extends ColumnsObj> = {
  name: string
  columns: C
}

export class Table<C extends ColumnsObj = ColumnsObj> {
  private mSchema?: Schema
  private readonly mColumns: C
  private readonly columnArray: readonly Column[]

  constructor(private readonly data: TableObj<C>) {
    this.mColumns = data.columns
    const columnArray: Column[] = []
    Object.values(data.columns).forEach(it => {
      columnArray.push(it)
      it.table = this
    })
    this.columnArray = columnArray
  }

  public set schema(schema: Schema) {
    if (this.mSchema === undefined)
      this.mSchema = schema
    else
      throw new Error('Schema can only be assigned one time')
  }

  public get schema(): Schema {
    if (this.mSchema === undefined)
      throw new Error('Table is undefined')

    return this.mSchema
  }

  public get columns(): C {
    return this.mColumns
  }

  /** Alias to get columns() */
  public get c(): C {
    return this.columns
  }

  public getColumn(columnName: string): Column|null {
    for (const col of this.columnArray) {
      if (col.columnName === columnName) {
        return col
      }
    }
    return null
  }

  public isColumnExist(column: Column): boolean {
    for (const col of this.columnArray) {
      if (col === column) {
        return true
      }
    }
    return false
  }

  public getColumns() {
    return this.data.columns
  }

  public toString() {
    return `"${escapeDoubleQuote(this.data.name)}"`
  }
}

type ColumnObj = {
  name: string
}

export abstract class Column {
  protected readonly binderStore = BinderStore.getInstance()
  private mTable?: Table

  protected constructor(public readonly data: ColumnObj) {}

  public set table(table: Table) {
    if (this.mTable === undefined)
      this.mTable = table
    else
      throw new Error('Table can only be assigned one time')
  }

  public get table(): Table {
    if (this.mTable === undefined)
      throw new Error('Table was not assigned')

    return this.mTable
  }

  public get columnName(): string {
    return this.data.name
  }

  public as(alias: string): SelectItemInfo {
    return new SelectItemInfo(this, alias)
  }

  public get asc(): OrderByItemInfo {
    return new OrderByItemInfo(this, ASC, NULLS_POSITION_NOT_EXIST)
  }

  public get desc(): OrderByItemInfo {
    return new OrderByItemInfo(this, DESC, NULLS_POSITION_NOT_EXIST)
  }

  public get nullsFirst(): OrderByItemInfo {
    return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_FIRST)
  }

  public get nullsLast(): OrderByItemInfo {
    return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_LAST)
  }

  public get ascNullsFirst(): OrderByItemInfo {
    return new OrderByItemInfo(this, ASC, NULLS_FIRST)
  }

  public get descNullsFirst(): OrderByItemInfo {
    return new OrderByItemInfo(this, DESC, NULLS_FIRST)
  }

  public get ascNullsLast(): OrderByItemInfo {
    return new OrderByItemInfo(this, ASC, NULLS_LAST)
  }

  public get descNullsLast(): OrderByItemInfo {
    return new OrderByItemInfo(this, DESC, NULLS_LAST)
  }

  public toString() {
    return `"${escapeDoubleQuote(this.data.name)}"`
  }
}

export class BooleanColumn extends Column implements Condition {
  // implement Condition
  public readonly leftExpression: Expression = new Expression(this)
  public readonly leftOperand: Operand = this.leftExpression.leftOperand
  public readonly type: ExpressionType = ExpressionType.BOOLEAN

  constructor(data: ColumnObj) {
    super(data)
  }

  public eq(value: null|BooleanLike): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|boolean): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public ne(value: null|BooleanLike): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public ne$(value: null|boolean): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public not(): Condition {
    return new Condition(new Expression(this, true))
  }

  public getColumns(): Column[] {
    return [this]
  }
}

export class NumberColumn extends Column {
  constructor(data: ColumnObj) {
    super(data)
  }

  public eq(value: null|NumberLike): Condition
  public eq(value1: NumberLike, op: Operator, value2: NumberLike): Condition
  public eq(value1: null|NumberLike, op?: Operator, value2?: NumberLike): Condition {
    if (op === undefined && value2 === undefined) {
      const qualifier = value1 === null ? NullOperator.Is : ComparisonOperator.Equal
      return new Condition(new Expression(this), qualifier, new Expression(value1))
    } else if (op !== undefined && value2 !== undefined) {
      return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(value1, op, value2))
    }
    throw new Error('not supported case')
  }

  public eq$(value: null|number): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public ne(value: null|NumberLike): Condition
  public ne(value1: NumberLike, op: Operator, value2: NumberLike): Condition
  public ne(value1: null|NumberLike, op?: Operator, value2?: NumberLike): Condition {
    if (op === undefined && value2 === undefined) {
      const qualifier = value1 === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
      return new Condition(new Expression(this), qualifier, new Expression(value1))
    } else if (op !== undefined && value2 !== undefined) {
      return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value1, op, value2))
    }
    throw new Error('not supported case')
  }

  public ne$(value: null|number): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public gt(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(value))
  }

  public gt$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(binder))
  }

  public ge(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(value))
  }

  public ge$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(binder))
  }

  public lt(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(value))
  }

  public lt$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(binder))
  }

  public le(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(value))
  }

  public le$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(binder))
  }
}

export class TextColumn extends Column {
  constructor(data: ColumnObj) {
    super(data)
  }

  public eq(value: Expression): Condition
  public eq(value: null|string|TextColumn): Condition
  public eq(value: null|string|TextColumn|Expression): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|string): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public ne(value: Expression): Condition
  public ne(value: null|string|TextColumn): Condition
  public ne(value: null|string|TextColumn|Expression): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public ne$(value: null|string): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public concat(value: TextLike): Expression {
    return new Expression(this, TextOperator.CONCAT, value)
  }
}
