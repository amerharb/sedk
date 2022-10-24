import { ReturningStep } from './ReturningStep'
import { BaseStep } from './BaseStep'
import { Column, Table } from '../database'
import { Condition, PrimitiveType } from '../models'
import { OnStep } from './OnStep'
import { SelectWhereStep } from './select-path/SelectConditionStep'
import { OrderByArgsElement } from '../orderBy'
import { All } from '../singletoneConstants'
import { HavingStep } from './HavingStep'
import { LogicalOperator } from '../operators'
import { ItemInfo } from '../ItemInfo'
import { ReturningItem } from '../ReturningItemInfo'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'
import { SetStep } from './SetStep'

export interface IAfterFromSteps extends BaseStep, OrderByStep {
	crossJoin(table: Table): CrossJoinStep

	join(table: Table): JoinStep

	leftJoin(table: Table): LeftJoinStep

	rightJoin(table: Table): RightJoinStep

	innerJoin(table: Table): InnerJoinStep

	fullOuterJoin(table: Table): FullOuterJoinStep

	where(condition: Condition): SelectWhereStep

	where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep

	where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep

	groupBy(...groupByItems: Column[]): GroupByStep

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep
}

export interface CrossJoinStep extends BaseStep, IAfterFromSteps {}

interface IJoinStep extends BaseStep {
	on(condition: Condition): OnStep
}

export interface JoinStep extends IJoinStep {}

export interface LeftJoinStep extends IJoinStep {}

export interface RightJoinStep extends IJoinStep {}

export interface InnerJoinStep extends IJoinStep {}

export interface FullOuterJoinStep extends IJoinStep {}

export interface OnOrStep extends OnStep {}

export interface OnAndStep extends OnStep {}

export interface GroupByStep extends BaseStep, OrderByStep {
	having(condition: Condition): HavingStep

	having(left: Condition, operator: LogicalOperator, right: Condition): HavingStep

	having(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingStep

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
}

export interface HavingOrStep extends HavingStep {}

export interface HavingAndStep extends HavingStep {}

export interface OrderByStep extends BaseStep, LimitStep {
	limit(n: null|number|All): LimitStep

	limit$(n: null|number): LimitStep
}

export interface LimitStep extends BaseStep, OffsetStep {
	offset(n: number): OffsetStep

	offset$(n: number): OffsetStep
}

export interface OffsetStep extends BaseStep {
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep
}

export interface ValuesStep extends BaseStep {
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep
}

export interface DefaultValuesStep extends BaseStep {
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep
}

export interface UpdateStep extends BaseStep {
	set(...items: UpdateSetItemInfo[]): SetStep
}
