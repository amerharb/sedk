import { BuilderData } from '../../builder'
import { BaseStep, Parenthesis } from '../BaseStep'
import { CrossJoinStep } from './CrossJoinStep'
import { All } from '../../singletoneConstants'
import { LimitStep } from './LimitStep'
import { OffsetStep } from './OffsetStep'
import { BooleanColumn, Column, Table } from '../../database'
import { ItemInfo } from '../../ItemInfo'
import { Condition, PrimitiveType } from '../../models'
import { LogicalOperator } from '../../operators'
import { OrderByArgsElement } from '../../orderBy'
import { ReturningItem } from '../../ReturningItemInfo'
import { SelectWhereStep } from './SelectConditionStep'
import { ReturningStep } from '../ReturningStep'
import {
	FullOuterJoinStep,
	InnerJoinStep,
	JoinStep,
	LeftJoinStep,
	RightJoinStep,
} from './BaseJoinStep'
import { OrderByStep } from './OrderByStep'
import { GroupByStep } from '../stepInterfaces'

export abstract class AfterFromStep extends BaseStep {
	protected constructor(data: BuilderData, prevStep: BaseStep) {
		super(data, prevStep)
	}

	public crossJoin(table: Table): CrossJoinStep {
		throw new Error('Method not implemented.')
	}

	public leftJoin(table: Table): LeftJoinStep {
		return new LeftJoinStep(this.data, this, table)
	}

	public rightJoin(table: Table): RightJoinStep {
		return new RightJoinStep(this.data, this, table)
	}

	public fullOuterJoin(table: Table): FullOuterJoinStep {
		return new FullOuterJoinStep(this.data, this, table)
	}

	public innerJoin(table: Table): InnerJoinStep {
		return new InnerJoinStep(this.data, this, table)
	}

	public join(table: Table): JoinStep {
		return new JoinStep(this.data, this, table)
	}

	public where(condition: Condition): SelectWhereStep
	public where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep
	public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep
	public where(condition: Condition, operator?: LogicalOperator, middle?: Condition, operator2?: LogicalOperator, right?: Condition): SelectWhereStep {
		const whereParts: (Condition|LogicalOperator|BooleanColumn|Parenthesis)[] = []
		BaseStep.addConditionParts(whereParts, condition, operator, middle, operator2, right)
		return new SelectWhereStep(this.data, this, whereParts)
	}

	groupBy(...groupByItems: Column[]): GroupByStep {
		throw new Error('Method not implemented.')
	}

	limit(n: number|All|null): LimitStep {
		return new LimitStep(this.data, this, n)
	}

	limit$(n: number|null): LimitStep {
		return new LimitStep(this.data, this, n, true)
	}

	offset(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n)
	}

	offset$(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n, true)
	}

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this.data, this, orderByItems)
	}

	// TODO: check if we can limit this to only update, insert and delete
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this.data, this, items)
	}
}
