import { BooleanColumn } from '../../database'
import { BaseStep, Parenthesis } from '../BaseStep'
import { BuilderData } from '../../builder'
import { Condition, Expression, PrimitiveType } from '../../models'
import { LogicalOperator } from '../../operators'
import { ReturningStep } from '../stepInterfaces'
import { ReturningItem } from '../../ReturningItemInfo'
import { returnStepOrThrow } from '../../util'
import { ItemInfo } from '../../ItemInfo'

abstract class DeleteConditionStep extends BaseStep {
	protected constructor(
		protected readonly conditionName: 'WHERE' | 'AND' | 'OR',
		data: BuilderData,
		prevStep: BaseStep,
		protected readonly whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		if (this.whereParts.length > 0) {
			BaseStep.throwIfConditionPartsInvalid(this.whereParts)
			const wherePartsString = this.whereParts.map(it => {
				if (it instanceof Condition || it instanceof Expression || it instanceof BooleanColumn) {
					return it.getStmt(this.data)
				}
				return it.toString()
			})
			return `${this.conditionName} ${wherePartsString.join(' ')}`
		}
		return ''
	}

	public and(condition: Condition): DeleteWhereStep
	public and(left: Condition, operator: LogicalOperator, right: Condition): DeleteWhereAndStep
	public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): DeleteWhereAndStep
	public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): DeleteWhereAndStep {
		const whereParts:(LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new DeleteWhereAndStep(this.data, this, whereParts)
	}

	public or(condition: Condition): DeleteWhereOrStep
	public or(left: Condition, operator: LogicalOperator, right: Condition): DeleteWhereOrStep
	public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): DeleteWhereOrStep
	public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): DeleteWhereOrStep {
		const whereParts:(LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new DeleteWhereOrStep(this.data, this, whereParts)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return returnStepOrThrow(this.data.step).returning(...items)
	}
}

export class DeleteWhereStep extends DeleteConditionStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super('WHERE', data, prevStep, whereParts)
	}
}

export class DeleteWhereOrStep extends DeleteConditionStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super('OR', data, prevStep, whereParts)
	}
}

export class DeleteWhereAndStep extends DeleteConditionStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super('AND', data, prevStep, whereParts)
	}
}

