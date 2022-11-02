import { UpdateSetItemInfo } from '../../UpdateSetItemInfo'
import { SetStep } from './SetStep'
import { Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'

export class UpdateStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
		private readonly table: Table,
	) {
		super(prevStep)
		this.throwIfTableNotInDb(table)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `UPDATE ${this.table.getStmt(this.data, artifacts)}`
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set([this.table]), columns: new Set() }
	}

	public set(...values: UpdateSetItemInfo[]): SetStep {
		return new SetStep(this, values)
	}
}
