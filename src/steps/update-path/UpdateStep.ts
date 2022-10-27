import { UpdateSetItemInfo } from '../../UpdateSetItemInfo'
import { SetStep } from './SetStep'
import { Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'
import { BuilderData } from '../../builder'

export class UpdateStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly table: Table,
	) {
		super(data, prevStep)
		this.throwIfTableNotInDb(table)
	}

	public getStepStatement(): string {
		return `UPDATE ${this.table.getStmt(this.data)}`
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set([this.table]), columns: new Set() }
	}

	public set(...values: UpdateSetItemInfo[]): SetStep {
		return new SetStep(this.data, this, values)
	}
}
