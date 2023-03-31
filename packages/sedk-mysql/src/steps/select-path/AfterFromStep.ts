import { BaseStep, Parenthesis } from '../BaseStep'
import { BooleanColumn, Column } from '../../database'
import { Condition } from '../../models'
import { LogicalOperator } from '../../operators'
import { OrderByArgsElement } from '../../orderBy'
import { SelectWhereStep } from './SelectConditionStep'
import { OrderByStep } from './OrderByStep'
import { GroupByStep } from './GroupByStep'

export abstract class AfterFromStep extends BaseStep {
	public where(condition: Condition): SelectWhereStep
	public where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep
	public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep
	public where(condition: Condition, operator?: LogicalOperator, middle?: Condition, operator2?: LogicalOperator, right?: Condition): SelectWhereStep {
		const whereParts: (Condition|LogicalOperator|BooleanColumn|Parenthesis)[] = []
		BaseStep.addConditionParts(whereParts, condition, operator, middle, operator2, right)
		return new SelectWhereStep(this, whereParts)
	}

	groupBy(...groupByItems: Column[]): GroupByStep {
		return new GroupByStep(this, groupByItems)
	}

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this, orderByItems)
	}
}
