import { AfterFromStep } from './AfterFromStep.ts'
import { AliasedTable, Table } from '../../database/index.ts'
import { Artifacts, BaseStep } from '../BaseStep.ts'

export type FromItem = Table|AliasedTable<Table>
export type FromItems = [FromItem, ...FromItem[]]

export class SelectFromStep extends AfterFromStep {
	constructor(
		prevStep: BaseStep,
		protected readonly fromItems: FromItems,
	) {
		super(prevStep)
		if (fromItems.length === 0) {
			throw new Error('No tables specified')
		}
		fromItems.forEach(it => this.throwIfTableNotInDb(BaseStep.getTable(it)))
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `FROM ${this.fromItems.map(it => it.getStmt(this.data, artifacts)).join(', ')}`
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(this.fromItems.map(it => it instanceof Table ? it : it.table)), columns: new Set() }
	}
}
