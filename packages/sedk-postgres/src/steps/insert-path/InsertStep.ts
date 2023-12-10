import { Artifacts, BaseStep } from '../BaseStep.ts'
import { Column, Table } from '../../database/index.ts'
import { IntoColumnsStep, IntoStep, IntoTableStep } from './IntoStep.ts'

export class InsertStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
	) {
		super(prevStep)
	}

	public getStepStatement(): string {
		return 'INSERT'
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	public into(table: Table): IntoTableStep
	public into(table: Table, ...columns: Column[]): IntoColumnsStep
	public into(table: Table, ...columns: Column[]): IntoStep {
		this.throwIfTableNotInDb(table)
		if (columns.length === 0) {
			return new IntoTableStep(this, table)
		}
		return new IntoTableStep(this, table)(...columns)
	}
}
