import { BooleanColumn } from '../../database/index.ts'
import { ConditionStep } from '../ConditionStep.ts'
import { BaseStep, Parenthesis } from '../BaseStep.ts'
import { Condition, PrimitiveType } from '../../models/index.ts'
import { LogicalOperator } from '../../operators.ts'
import { ReturningStep } from '../ReturningStep.ts'
import { ReturningItem } from '../../ReturningItemInfo.ts'
import { ItemInfo } from '../../ItemInfo.ts'

export abstract class UpdateConditionStep extends ConditionStep {
	public and(condition: Condition): UpdateConditionStep
	public and(left: Condition, operator: LogicalOperator, right: Condition): UpdateWhereAndStep
	public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): UpdateWhereAndStep
	public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): UpdateWhereAndStep {
		const whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new UpdateWhereAndStep(this, whereParts)
	}

	public or(condition: Condition): UpdateWhereOrStep
	public or(left: Condition, operator: LogicalOperator, right: Condition): UpdateWhereOrStep
	public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): UpdateWhereOrStep
	public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): UpdateWhereOrStep {
		const whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new UpdateWhereOrStep(this, whereParts)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
	}
}

export class UpdateWhereStep extends UpdateConditionStep {
	constructor(prevStep: BaseStep, whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[]) {
		super('WHERE', prevStep, whereParts)
	}
}

export class UpdateWhereOrStep extends UpdateConditionStep {
	constructor(prevStep: BaseStep, whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[]) {
		super('OR', prevStep, whereParts)
	}
}

export class UpdateWhereAndStep extends UpdateConditionStep {
	constructor(prevStep: BaseStep, whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[]) {
		super('AND', prevStep, whereParts)
	}
}

