import { Artifacts } from './steps/BaseStep.ts'
import { Table } from './database/index.ts'
import { IStatementGiver } from './models/index.ts'
import { BuilderData } from './builder.ts'

export class TableAsterisk implements IStatementGiver{
	constructor(public readonly table: Table) {}

	public getStmt(data:BuilderData, artifacts: Artifacts): string {
		return `${this.table.getStmt(data, artifacts)}.*`
	}
}
