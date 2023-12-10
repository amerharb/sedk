import { ConditionStep } from '../ConditionStep.ts'
import { BooleanColumn } from '../../database/index.ts'
import { BaseStep, Parenthesis } from '../BaseStep.ts'
import { Condition, PrimitiveType } from '../../models/index.ts'
import { LogicalOperator } from '../../operators.ts'
import { ReturningStep } from '../ReturningStep.ts'
import { ReturningItem } from '../../ReturningItemInfo.ts'
import { ItemInfo } from '../../ItemInfo.ts'

abstract class DeleteConditionStep extends ConditionStep {
	public and(condition: Condition): DeleteWhereStep
	public and(left: Condition, operator: LogicalOperator, right: Condition): DeleteWhereAndStep
	public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): DeleteWhereAndStep
	public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): DeleteWhereAndStep {
		const whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new DeleteWhereAndStep(this, whereParts)
	}

	public or(condition: Condition): DeleteWhereOrStep
	public or(left: Condition, operator: LogicalOperator, right: Condition): DeleteWhereOrStep
	public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): DeleteWhereOrStep
	public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): DeleteWhereOrStep {
		const whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new DeleteWhereOrStep(this, whereParts)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
	}
}

export class DeleteWhereStep extends DeleteConditionStep {
	constructor(
		prevStep: BaseStep,
		whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super('WHERE', prevStep, whereParts)
	}
}

export class DeleteWhereOrStep extends DeleteConditionStep {
	constructor(
		prevStep: BaseStep,
		whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super('OR', prevStep, whereParts)
	}
}

export class DeleteWhereAndStep extends DeleteConditionStep {
	constructor(
		prevStep: BaseStep,
		whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super('AND', prevStep, whereParts)
	}
}

