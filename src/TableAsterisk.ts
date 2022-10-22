import { Table } from './database'
import { IStatementGiver } from './models'
import { BuilderData } from './builder'

export class TableAsterisk implements IStatementGiver{
	constructor(public readonly table: Table) {}

	public getStmt(data:BuilderData): string {
		return `${this.table.getStmt(data)}.*`
	}
}
