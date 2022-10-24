import { BuilderData } from '../builder'
import { ReturningItemInfo } from '../ReturningItemInfo'
import { BaseStep } from './BaseStep'

export class ReturningStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly returningItems: ReturningItemInfo[],
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		if (this.returningItems.length > 0) {
			return 'RETURNING ' + this.returningItems.map(it => it.getStmt(this.data)).join(', ')
		}
		return ''
	}
}
