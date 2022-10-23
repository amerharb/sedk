import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Column, Table } from '../database'
import { IntoStep } from './IntoStep'

export class InsertStep extends BaseStep {
	constructor(
		protected readonly data: BuilderData,
		protected readonly prevStep: BaseStep,
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		throw new Error('Method not implemented.')
	}

	public into(table: Table, ...columns:Column[]): IntoStep {
		this.throwIfTableNotInDb(table)
		this.data.insertIntoTable = table
		this.data.insertIntoColumns.push(...columns)
		return new IntoStep(this.data, this)
	}
}
