import { OffsetStep } from './OffsetStep.ts'
import { LimitStep } from './LimitStep.ts'
import { OrderByStep } from './OrderByStep.ts'
import { ConditionStep } from '../ConditionStep.ts'
import { BaseStep, Parenthesis } from '../BaseStep.ts'
import { Condition, PrimitiveType } from '../../models/index.ts'
import { BooleanColumn, Column } from '../../database/index.ts'
import { OrderByArgsElement } from '../../orderBy.ts'
import { All } from '../../singletoneConstants.ts'
import { GroupByStep } from './GroupByStep.ts'
import { LogicalOperator } from '../../operators.ts'
import { ItemInfo } from '../../ItemInfo.ts'
import { ReturningItem } from '../../ReturningItemInfo.ts'
import { ReturningStep } from '../ReturningStep.ts'

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

	//TODO: check if we should have returning as this is path of select
	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
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
