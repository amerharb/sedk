import { BaseStep } from './BaseStep'
import { SelectItemInfo } from '../select'
import { Table } from '../database'
import { Condition } from '../expressions/Condition'
import { WhereStep } from './WhereStep'
import { Column } from '../columns'
import { OrderByArgsElement } from '../orderBy'
import { All } from '../singletoneConstants'
import { HavingStep } from './HavingStep'
import { PrimitiveType, SelectItem } from './Step'
import { LogicalOperator } from '../operators'

export interface RootStep extends BaseStep {
  select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep

  selectDistinct(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep

  selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
}

export interface SelectStep extends BaseStep {
  from(table: Table): FromStep
}

export interface FromStep extends BaseStep {
  where(condition: Condition): WhereStep

  where(left: Condition, operator: LogicalOperator, right: Condition): WhereStep

  where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereStep

  groupBy(...groupByItems: Column[]): GroupByStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

  limit(n: null|number|All): LimitStep

  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep

  offset$(n: number): OffsetStep
}

export interface WhereAndStep extends BaseStep {
  and(condition: Condition): WhereAndStep

  and(left: Condition, operator: LogicalOperator, right: Condition): WhereAndStep

  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereAndStep

  or(condition: Condition): WhereOrStep

  or(left: Condition, operator: LogicalOperator, right: Condition): WhereOrStep

  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereOrStep

  groupBy(...groupByItems: Column[]): GroupByStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

  limit(n: null|number|All): LimitStep

  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep

  offset$(n: number): OffsetStep
}

export interface WhereOrStep extends BaseStep {
  or(condition: Condition): WhereOrStep

  or(left: Condition, operator: LogicalOperator, right: Condition): WhereOrStep

  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereOrStep

  and(condition: Condition): WhereAndStep

  and(left: Condition, operator: LogicalOperator, right: Condition): WhereAndStep

  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereAndStep

  groupBy(...groupByItems: Column[]): GroupByStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

  limit(n: null|number|All): LimitStep

  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep

  offset$(n: number): OffsetStep
}

export interface GroupByStep extends BaseStep {
  having(condition: Condition): HavingStep

  having(left: Condition, operator: LogicalOperator, right: Condition): HavingStep

  having(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

  limit(n: null|number|All): LimitStep

  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep

  offset$(n: number): OffsetStep
}

export interface HavingOrStep extends BaseStep {
  or(condition: Condition): HavingOrStep

  or(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep

  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep

  and(condition: Condition): HavingAndStep

  and(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep

  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

  limit(n: null|number|All): LimitStep

  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep

  offset$(n: number): OffsetStep
}

export interface HavingAndStep extends BaseStep {
  and(condition: Condition): HavingAndStep

  and(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep

  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep

  or(condition: Condition): HavingOrStep

  or(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep

  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

  limit(n: null|number|All): LimitStep

  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep

  offset$(n: number): OffsetStep
}

export interface OrderByStep extends BaseStep {
  limit(n: null|number|All): LimitStep

  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep

  offset$(n: number): OffsetStep
}

export interface LimitStep extends BaseStep {
  offset(n: number): OffsetStep

  offset$(n: number): OffsetStep
}

export interface OffsetStep extends BaseStep {}
