import { BaseStep } from './BaseStep'
import { SelectItemInfo } from '../SelectItemInfo'
import { AliasedTable, Table } from '../database'
import { Condition } from '../models/Condition'
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
  from(...tables: (Table|AliasedTable)[]): FromStep
}

interface AfterFromSteps extends BaseStep, OrderByStep {
  crossJoin(table: Table): CrossJoinStep

  where(condition: Condition): WhereStep

  where(left: Condition, operator: LogicalOperator, right: Condition): WhereStep

  where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereStep

  groupBy(...groupByItems: Column[]): GroupByStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
}

export interface FromStep extends BaseStep, AfterFromSteps {}

export interface CrossJoinStep extends BaseStep, AfterFromSteps {}

export interface WhereOrStep extends WhereStep {}

export interface WhereAndStep extends WhereStep {}

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

export interface OffsetStep extends BaseStep {}
