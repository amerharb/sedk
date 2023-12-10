import { FromItem } from '../select-path/SelectFromStep.ts'
import { Artifacts, BaseStep } from '../BaseStep.ts'
import { DeleteFromStep } from './DeleteFromStep.ts'

export class DeleteStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
	) {
		super(prevStep)
	}

	public getStepStatement(): string {
		return 'DELETE'
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	public from(table: FromItem): DeleteFromStep {
		this.throwIfTableNotInDb(BaseStep.getTable(table))
		return new DeleteFromStep(this, table)
	}
}
