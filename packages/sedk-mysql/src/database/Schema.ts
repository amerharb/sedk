import { escapeDoubleQuote } from '../util'
import { INameGiver } from './INameGiver'
import { Column } from './Column'
import { Database } from './Database'
import { Table } from './Table'

type TablesObj = {
	[tableName: string]: Table
}

type SchemaObj<T extends TablesObj> = {
	name?: string
	tables: T
}

export class Schema<T extends TablesObj = TablesObj> implements INameGiver {
	private mDatabase?: Database
	private readonly mTables: T
	private readonly tableArray: readonly Table[]
	private readonly mName: string

	constructor(private readonly data: SchemaObj<T>) {
		this.mName = data.name ?? 'public'
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

	public get name(): string {
		return this.mName
	}

	public get fqName(): string {
		return `"${escapeDoubleQuote(this.mName)}"`
	}

	public get tables(): T {
		return this.mTables
	}

	/** Alias to get tables() */
	public get t(): T {
		return this.tables
	}

	public isTableExist(table: Table): boolean {
		return this.tableArray.includes(table)
	}

	public isColumnExist(column: Column): boolean {
		return this.tableArray.some(it => it.isColumnExist(column))
	}
}
