import { BaseStep } from './BaseStep'
import { Condition, PrimitiveType } from '../models'
import { UpdateWhereStep } from './UpdateWhereStep'
import { LogicalOperator } from '../operators'
import { ItemInfo } from '../ItemInfo'
import { ReturningItem } from '../ReturningItemInfo'
import { ReturningStep } from './ReturningStep'
import { returnStepOrThrow } from '../util'
import { BuilderData } from '../builder'

export class SetStep extends BaseStep {
	constructor(
		protected readonly data: BuilderData,
		protected readonly prevStep: BaseStep,
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		throw new Error('Method not implemented.')
	}

	public where(condition: Condition): UpdateWhereStep
	public where(left: Condition, operator: LogicalOperator, right: Condition): UpdateWhereStep
	public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): UpdateWhereStep
	public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): UpdateWhereStep {
		// TODO: code for the new way
		return new UpdateWhereStep(this.data, this)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return returnStepOrThrow(this.data.step).returning(...items)
	}
}
