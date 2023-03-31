import { OrderByStep } from './OrderByStep'
import { ConditionStep } from '../ConditionStep'
import { BaseStep, Parenthesis } from '../BaseStep'
import { Condition } from '../../models'
import { BooleanColumn, Column } from '../../database'
import { OrderByArgsElement } from '../../orderBy'
import { GroupByStep } from './GroupByStep'
import { LogicalOperator } from '../../operators'

abstract class SelectConditionStep extends ConditionStep {
	public and(condition: Condition): SelectWhereAndStep
	public and(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereAndStep
	public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereAndStep
	public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): SelectWhereAndStep {
		const whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new SelectWhereAndStep(this, whereParts)
	}

	public or(condition: Condition): SelectWhereOrStep
	public or(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereOrStep
	public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereOrStep
	public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): SelectWhereOrStep {
		const whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new SelectWhereOrStep(this, whereParts)
	}

	public groupBy(...groupByItems: Column[]): GroupByStep {
		return new GroupByStep(this, groupByItems)
	}

	public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this, orderByItems)
	}
}

export class SelectWhereStep extends SelectConditionStep {
	constructor(
		prevStep: BaseStep,
		whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super('WHERE', prevStep, whereParts)
	}
}

export class SelectWhereAndStep extends SelectConditionStep {
	constructor(
		prevStep: BaseStep,
		whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super('AND', prevStep, whereParts)
	}
}

export class SelectWhereOrStep extends SelectConditionStep {
	constructor(
		prevStep: BaseStep,
		whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super('OR', prevStep, whereParts)
	}
}
