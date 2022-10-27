import { FromItem } from '../Step'
import { Artifacts, BaseStep } from '../BaseStep'
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

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	public from(table: FromItem): DeleteFromStep {
		this.throwIfTableNotInDb(BaseStep.getTable(table))
		this.addFromItemInfo(table, FromItemRelation.NO_RELATION)
		return new DeleteFromStep(this.data, this, table)
	}
}
