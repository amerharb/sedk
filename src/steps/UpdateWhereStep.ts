import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition, PrimitiveType } from '../models'
import { LogicalOperator } from '../operators'
import { ReturningStep } from './stepInterfaces'
import { ReturningItem } from '../ReturningItemInfo'
import { returnStepOrThrow } from '../util'
import { ItemInfo } from '../ItemInfo'

export interface UpdateWhereOrStep extends UpdateWhereStep {}

export interface UpdateWhereAndStep extends UpdateWhereStep {}

export class UpdateWhereStep extends BaseStep {
	constructor(
		protected readonly data: BuilderData,
		protected readonly prevStep: BaseStep,
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		throw new Error('Method not implemented.')
	}

	public and(condition: Condition): UpdateWhereStep
	public and(left: Condition, operator: LogicalOperator, right: Condition): UpdateWhereAndStep
	public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): UpdateWhereAndStep
	public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): UpdateWhereAndStep {
		// TODO: code for the new way
		return this
	}

	public or(condition: Condition): UpdateWhereOrStep
	public or(left: Condition, operator: LogicalOperator, right: Condition): UpdateWhereOrStep
	public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): UpdateWhereOrStep
	public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): UpdateWhereOrStep {
		// TODO: code for the new way
		return this
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return returnStepOrThrow(this.data.step).returning(...items)
	}
}
