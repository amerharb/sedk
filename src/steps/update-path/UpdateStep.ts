import { UpdateSetItemInfo } from '../../UpdateSetItemInfo'
import { SetStep } from './SetStep'
import { Table } from '../../database'
import { BaseStep } from '../BaseStep'
import { BuilderData } from '../../builder'

export class UpdateStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly table: Table,
	) {
		super(data, prevStep)
		this.throwIfTableNotInDb(table)
	}

	public getStepStatement(): string {
		return `UPDATE ${this.table.getStmt(this.data)}`
	}

	public set(...values: UpdateSetItemInfo[]): SetStep {
		// this.data.insertIntoValues.push(...values)
		// return returnStepOrThrow(this.data.step)
		return new SetStep(this.data, this, values)
	}
}
