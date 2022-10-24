import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition, PrimitiveType } from '../models'
import { Column, Table } from '../database'
import { OrderByArgsElement } from '../orderBy'
import { All } from '../singletoneConstants'
import {
	CrossJoinStep, FullOuterJoinStep, GroupByStep, IAfterFromSteps, InnerJoinStep, JoinStep,
	LeftJoinStep, OnAndStep, OnOrStep, OrderByStep, RightJoinStep,
} from './stepInterfaces'
import { LogicalOperator } from '../operators'
import { SelectWhereStep } from './select-path/SelectConditionStep'
import { returnStepOrThrow } from '../util'
import { ItemInfo } from '../ItemInfo'
import { ReturningItem } from '../ReturningItemInfo'
import { ReturningStep } from './ReturningStep'
import { OffsetStep } from './select-path/OffsetStep'
import { LimitStep } from './select-path/LimitStep'


export class OnStep extends BaseStep implements IAfterFromSteps {
	constructor(
		protected readonly data: BuilderData,
		protected readonly prevStep: BaseStep,
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		throw new Error('Method not implemented.')
	}

	public or(condition: Condition): OnOrStep {
		this.data.fromItemInfos[this.data.fromItemInfos.length - 1].addOrCondition(condition)
		return this
	}

	public and(condition: Condition): OnAndStep {
		this.data.fromItemInfos[this.data.fromItemInfos.length - 1].addAndCondition(condition)
		return this
	}

	public crossJoin(table: Table): CrossJoinStep {
		return returnStepOrThrow(this.data.step).crossJoin(table)
	}

	public join(table: Table): JoinStep {
		return returnStepOrThrow(this.data.step).join(table)
	}

	public leftJoin(table: Table): LeftJoinStep {
		return returnStepOrThrow(this.data.step).leftJoin(table)
	}

	public rightJoin(table: Table): RightJoinStep {
		return returnStepOrThrow(this.data.step).rightJoin(table)
	}

	public innerJoin(table: Table): InnerJoinStep {
		return returnStepOrThrow(this.data.step).innerJoin(table)
	}

	public fullOuterJoin(table: Table): FullOuterJoinStep {
		return returnStepOrThrow(this.data.step).fullOuterJoin(table)
	}

	where(condition: Condition): SelectWhereStep
	where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep
	where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep
	public where(left: Condition, operator?: LogicalOperator, right?: Condition): SelectWhereStep {
		return returnStepOrThrow(this.data.step).where(left, operator, right)
	}

	public groupBy(...groupByItems: Column[]): GroupByStep {
		return returnStepOrThrow(this.data.step).groupBy(...groupByItems)
	}

	public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return returnStepOrThrow(this.data.step).orderBy(...orderByItems)
	}

	public limit(n: null|number|All): LimitStep {
		return new LimitStep(this.data, this, n)
	}

	public limit$(n: null|number): LimitStep {
		return new LimitStep(this.data, this, n, true)
	}

	public offset(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n)
	}

	public offset$(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n, true)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return returnStepOrThrow(this.data.step).returning(...items)
	}
}
