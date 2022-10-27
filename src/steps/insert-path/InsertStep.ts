import { Artifacts, BaseStep } from '../BaseStep'
import { BuilderData } from '../../builder'
import { Column, Table } from '../../database'
import { IntoStep } from './IntoStep'

export class InsertStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		return 'INSERT'
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	public into(table: Table, ...columns:Column[]): IntoStep {
		this.throwIfTableNotInDb(table)
		return new IntoStep(this.data, this, table, columns)
	}
}
