import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { AliasedTable, Table } from '../database'
import { DeleteFromStep } from './DeleteFromStep'
import { FromItemRelation } from '../FromItemInfo'

export class DeleteStep extends BaseStep {
	constructor(
		protected readonly data: BuilderData,
		protected readonly prevStep: BaseStep,
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		throw new Error('Method not implemented.')
	}

	public from(table: Table|AliasedTable): DeleteFromStep {
		this.throwIfTableNotInDb(BaseStep.getTable(table))
		this.addFromItemInfo(table, FromItemRelation.NO_RELATION)
		return new DeleteFromStep(this.data, this)
	}
}
