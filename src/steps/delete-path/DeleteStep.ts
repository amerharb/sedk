import { FromItem } from '../select-path/SelectFromStep'
import { Artifacts, BaseStep } from '../BaseStep'
import { DeleteFromStep } from './DeleteFromStep'

export class DeleteStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
	) {
		super(prevStep)
	}

	public getStepStatement(): string {
		return 'DELETE'
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	public from(table: FromItem): DeleteFromStep {
		this.throwIfTableNotInDb(BaseStep.getTable(table))
		return new DeleteFromStep(this, table)
	}
}
