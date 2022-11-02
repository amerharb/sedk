import { AfterFromStep } from './AfterFromStep'
import { BuilderData } from '../../builder'
import { AliasedTable, Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'

export type FromItem = Table|AliasedTable
export type FromItems = [FromItem, ...FromItem[]]

export class SelectFromStep extends AfterFromStep {
	public constructor(
		data: BuilderData,
		prevStep: BaseStep,
		protected readonly fromItems: FromItems,
	) {
		super(data, prevStep)
		if (fromItems.length === 0) {
			throw new Error('No tables specified')
		}
		fromItems.forEach(it => this.throwIfTableNotInDb(BaseStep.getTable(it)))
	}

	getStepStatement(): string {
		return `FROM ${this.fromItems.map(it => it.getStmt(this.data)).join(', ')}`
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(this.fromItems.map(it => it instanceof Table ? it : it.table)), columns: new Set() }
	}
}

