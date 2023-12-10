import { Column } from './Column.ts'
import { Schema } from './Schema.ts'
import { Table } from './Table.ts'

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
		return this.schemaArray.includes(schema)
	}

	public hasTable(table: Table): boolean {
		return this.schemaArray.some(it => it.isTableExist(table))
	}

	public hasColumn(column: Column): boolean {
		return this.schemaArray.some(it => it.isColumnExist(column))
	}
}
