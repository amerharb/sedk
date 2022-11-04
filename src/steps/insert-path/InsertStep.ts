import { Artifacts, BaseStep } from '../BaseStep'
import { Column, Table } from '../../database'
import { IntoStep } from './IntoStep'

export class InsertStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
	) {
		super(prevStep)
	}

	public getStepStatement(): string {
		return 'INSERT'
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	public into(table: Table, ...columns:Column[]): IntoStep {
		this.throwIfTableNotInDb(table)
		return new IntoStep(this, table, columns)
	}
}
