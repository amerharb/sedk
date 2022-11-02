import { FromItem } from '../select-path/SelectFromStep'
import { Artifacts, BaseStep } from '../BaseStep'
import { BuilderData } from '../../builder'
import { DeleteFromStep } from './DeleteFromStep'

export class DeleteStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
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
		return new DeleteFromStep(this.data, this, table)
	}
}
