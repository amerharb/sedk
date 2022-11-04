import { AfterFromStep } from './AfterFromStep'
import { AliasedTable, Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'

export type FromItem = Table|AliasedTable
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

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(this.fromItems.map(it => it instanceof Table ? it : it.table)), columns: new Set() }
	}
}
