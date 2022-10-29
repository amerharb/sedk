import { LimitStep } from './select-path/LimitStep'
import { ReturningStep } from './ReturningStep'
import { Artifacts, BaseStep } from './BaseStep'
import { AliasedTable, Column, Table } from '../database'
import { Condition, PrimitiveType } from '../models'
import { OnStep } from './select-path/OnStep'
import { SelectWhereStep } from './select-path/SelectConditionStep'
import { OffsetStep } from './select-path/OffsetStep'
import { OrderByArgsElement } from '../orderBy'
import { All } from '../singletoneConstants'
import { HavingStep } from './HavingStep'
import { LogicalOperator } from '../operators'
import { ItemInfo } from '../ItemInfo'
import { ReturningItem } from '../ReturningItemInfo'
import { FullOuterJoinStep, InnerJoinStep, JoinStep, LeftJoinStep, RightJoinStep } from './select-path/BaseJoinStep'

export interface IAfterFromSteps extends BaseStep, OrderByStep {
	crossJoin(table: Table|AliasedTable): CrossJoinStep

	join(table: Table|AliasedTable): JoinStep

	leftJoin(table: Table|AliasedTable): LeftJoinStep

	rightJoin(table: Table|AliasedTable): RightJoinStep

	innerJoin(table: Table|AliasedTable): InnerJoinStep

	fullOuterJoin(table: Table|AliasedTable): FullOuterJoinStep

	where(condition: Condition): SelectWhereStep

	where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep

	where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep

	groupBy(...groupByItems: Column[]): GroupByStep

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep

	getStepStatement(artifacts?: Artifacts): string
}

export interface CrossJoinStep extends IAfterFromSteps {}

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

export interface OrderByStep extends BaseStep, ILimitStep {
	limit(n: null|number|All): LimitStep

	limit$(n: null|number): LimitStep
}

export interface ILimitStep extends BaseStep, IOffsetStep {
	offset(n: number): OffsetStep

	offset$(n: number): OffsetStep
}

export interface IOffsetStep extends BaseStep {
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep
}
