import { BaseStep } from './BaseStep'
import { Condition } from '../models'
import { OnStep } from './select-path/AfterFromStep'
import { OrderByStep } from './select-path/OrderByStep'
import { OrderByArgsElement } from '../orderBy'
import { HavingStep } from './HavingStep'
import { LogicalOperator } from '../operators'

export interface OnOrStep extends OnStep {}

export interface OnAndStep extends OnStep {}

export interface GroupByStep extends BaseStep {
	having(condition: Condition): HavingStep

	having(left: Condition, operator: LogicalOperator, right: Condition): HavingStep

	having(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingStep

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
}

export interface HavingOrStep extends HavingStep {}

export interface HavingAndStep extends HavingStep {}
