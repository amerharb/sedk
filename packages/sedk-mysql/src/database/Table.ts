import { Artifacts } from '../steps/BaseStep'
import { INameGiver } from './INameGiver'
import { BuilderData } from '../builder'
import { BooleanColumn } from './BooleanColumn'
import { Column } from './Column'
import { DateColumn } from './DateColumn'
import { NumberColumn } from './NumberColumn'
import { Schema } from './Schema'
import { TextColumn } from './TextColumn'
import { IStatementGiver } from '../models'
import { TableAsterisk } from '../TableAsterisk'
import { escapeBackTick } from '../util'

type ColumnsObj = {
	[columnName: string]: BooleanColumn | NumberColumn | TextColumn | DateColumn
}

type TableObj<C extends ColumnsObj> = {
	name: string
	columns: C
}

export class Table<C extends ColumnsObj = ColumnsObj> implements INameGiver, IStatementGiver {
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

	public get fqName(): string {
		return `${this.schema.fqName}.\`${escapeBackTick(this.data.name)}\``
	}

	public as(alias: string): AliasedTable<typeof this> {
		return new AliasedTable(this, alias)
	}

	public get columns(): C {
		return this.mColumns
	}

	/** Alias to get columns() */
	public get c(): C {
		return this.columns
	}

	/**
	 * Returns array of table's columns, this is different from
	 * columns() property which returns an object with column name as key
	 */
	public getColumns(): readonly Column[] {
		return this.columnArray
	}

	public get ASTERISK(): TableAsterisk {
		return new TableAsterisk(this)
	}

	public isColumnExist(column: Column): boolean {
		return this.columnArray.includes(column)
	}

	public getStmt(data: BuilderData, artifacts: Artifacts): string {
		if (this.mSchema === undefined)
			throw new Error('Schema is undefined')

		const schemaName = (
			this.mSchema.name !== 'public'
			|| data.option.addPublicSchemaName === 'always'
			|| (data.option.addPublicSchemaName === 'when other schema mentioned'
				&& Array.from(artifacts.tables).some(it => it.schema.name !== 'public'))
		)
			? `${this.mSchema.fqName}.`
			: ''
		return `${schemaName}\`${escapeBackTick(this.data.name)}\``
	}
}

export class AliasedTable<T extends Table> implements INameGiver, IStatementGiver {
	constructor(public readonly table: T, public readonly alias: string) {
	}

	public getStmt(data: BuilderData, artifacts: Artifacts): string {
		const escapedAlias = escapeBackTick(this.alias)
		const asString = (data.option.addAsBeforeTableAlias === 'always') ? ' AS' : ''
		return `${this.table.getStmt(data, artifacts)}${asString} \`${escapedAlias}\``
	}

	get name(): string {
		return this.table.name
	}

	public get fqName(): string {
		return this.table.fqName
	}
}
