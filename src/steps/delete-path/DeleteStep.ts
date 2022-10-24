import { FromItem } from '../Step'
import { BaseStep } from '../BaseStep'
import { BuilderData } from '../../builder'
import { DeleteFromStep } from './DeleteFromStep'
import { FromItemRelation } from '../../FromItemInfo'

export class DeleteStep extends BaseStep {
	constructor(
		protected readonly data: BuilderData,
		protected readonly prevStep: BaseStep,
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		return 'DELETE'
	}

	public from(table: FromItem): DeleteFromStep {
		this.throwIfTableNotInDb(BaseStep.getTable(table))
		this.addFromItemInfo(table, FromItemRelation.NO_RELATION)
		return new DeleteFromStep(this.data, this, table)
	}
}
