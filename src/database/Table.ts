import { BuilderData } from '../builder'
import { BooleanColumn } from './BooleanColumn'
import { Column } from './Column'
import { DateColumn } from './DateColumn'
import { NumberColumn } from './NumberColumn'
import { Schema } from './Schema'
import { TextColumn } from './TextColumn'
import { IStatementGiver } from '../models/IStatementGiver'
import { TableAsterisk } from '../TableAsterisk'
import { escapeDoubleQuote } from '../util'

type ColumnsObj = {
	[columnName: string]: BooleanColumn|NumberColumn|TextColumn|DateColumn
}

type TableObj<C extends ColumnsObj> = {
	name: string
	columns: C
}

export class Table<C extends ColumnsObj = ColumnsObj> implements IStatementGiver {
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
			throw new Error('Schema is undefined')

		return this.mSchema
	}

	public get name(): string {
		return this.data.name
	}

	public as(alias: string): AliasedTable {
		return new AliasedTable(this, alias)
	}

	public get columns(): C {
		return this.mColumns
	}

	/** Alias to get columns() */
	public get c(): C {
		return this.columns
	}

	public get ASTERISK(): TableAsterisk {
		return new TableAsterisk(this)
	}

	public isColumnExist(column: Column): boolean {
		return this.columnArray.includes(column)
	}

	public getStmt(data: BuilderData): string {
		if (this.mSchema === undefined)
			throw new Error('Table is undefined')

		const schemaName = (
			this.mSchema.name !== 'public'
			|| data.option.addPublicSchemaName === 'always'
			|| (data.option.addPublicSchemaName === 'when other schema mentioned'
				&& data.fromItemInfos.some(it => it.table.schema.name !== 'public'))
		) ? `"${escapeDoubleQuote(this.mSchema.name)}".` : ''
		return `${schemaName}"${escapeDoubleQuote(this.data.name)}"`
	}
}

export class AliasedTable {
	constructor(public readonly table: Table, public readonly alias: string) {}
}