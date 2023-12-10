import { ConditionStep } from '../ConditionStep.ts'
import { BooleanColumn } from '../../database/index.ts'
import { BaseStep, Parenthesis } from '../BaseStep.ts'
import { Condition } from '../../models/index.ts'
import { OrderByArgsElement } from '../../orderBy.ts'
import { All } from '../../singletoneConstants.ts'
import { LogicalOperator } from '../../operators.ts'
import { OffsetStep } from './OffsetStep.ts'
import { LimitStep } from './LimitStep.ts'
import { OrderByStep } from './OrderByStep.ts'

abstract class HavingConditionStep extends ConditionStep {
	public and(condition: Condition): HavingAndStep
	public and(left: Condition, operator: LogicalOperator, right: Condition): HavingAndStep
	public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingAndStep
	public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingAndStep {
		const havingParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(havingParts, cond1, op1, cond2, op2, cond3)
		return new HavingAndStep(this, havingParts)
	}

	public or(condition: Condition): HavingOrStep
	public or(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep
	public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep
	public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingOrStep {
		const havingParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(havingParts, cond1, op1, cond2, op2, cond3)
		return new HavingOrStep(this, havingParts)
	}

	public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this, orderByItems)
	}

	public limit(n: null|number|All): LimitStep {
		return new LimitStep(this, n)
	}

	public limit$(n: null|number): LimitStep {
		return new LimitStep(this, n, true)
	}

	public offset(n: number): OffsetStep {
		return new OffsetStep(this, n)
	}

	public offset$(n: number): OffsetStep {
		return new OffsetStep(this, n, true)
	}
}

export class HavingStep extends HavingConditionStep {
	constructor(
		step: BaseStep,
		havingParts: (Condition|LogicalOperator|BooleanColumn|Parenthesis)[],
	) {
		super('HAVING', step, havingParts)
	}
}

export class HavingAndStep extends HavingConditionStep {
	constructor(
		step: BaseStep,
		havingParts: (Condition|LogicalOperator|BooleanColumn|Parenthesis)[],
	) {
		super('AND', step, havingParts)
	}
}

export class HavingOrStep extends HavingConditionStep {
	constructor(
		step: BaseStep,
		havingParts: (Condition|LogicalOperator|BooleanColumn|Parenthesis)[],
	) {
		super('OR', step, havingParts)
	}
}
