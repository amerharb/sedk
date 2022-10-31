import { Artifacts, BaseStep, Parenthesis } from '../BaseStep'
import { BuilderData } from '../../builder'
import { Condition, PrimitiveType } from '../../models'
import { BooleanColumn, Column, Table } from '../../database'
import { OrderByArgsElement } from '../../orderBy'
import { All } from '../../singletoneConstants'
import {
	CrossJoinStep,
	GroupByStep,
	IAfterFromSteps,
	OnAndStep,
	OnOrStep,
} from '../stepInterfaces'
import {
	FullOuterJoinStep,
	InnerJoinStep,
	JoinStep,
	LeftJoinStep,
	RightJoinStep,
} from './BaseJoinStep'
import { LogicalOperator } from '../../operators'
import { SelectWhereStep } from './SelectConditionStep'
import { returnStepOrThrow } from '../../util'
import { ItemInfo } from '../../ItemInfo'
import { ReturningItem } from '../../ReturningItemInfo'
import { ReturningStep } from '../../steps/ReturningStep'
import { OffsetStep } from './OffsetStep'
import { LimitStep } from './LimitStep'
import { OrderByStep } from './OrderByStep'


export class OnStep extends BaseStep implements IAfterFromSteps {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly condition: Condition
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		return `ON ${this.condition.getStmt(this.data)}`
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.condition.getColumns()) }
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
		return new JoinStep(this.data, this, table)
	}

	public leftJoin(table: Table): LeftJoinStep {
		return new LeftJoinStep(this.data, this, table)
	}

	public rightJoin(table: Table): RightJoinStep {
		return new RightJoinStep(this.data, this, table)
	}

	public innerJoin(table: Table): InnerJoinStep {
		return new InnerJoinStep(this.data, this, table)
	}

	public fullOuterJoin(table: Table): FullOuterJoinStep {
		return new FullOuterJoinStep(this.data, this, table)
	}

	where(condition: Condition): SelectWhereStep
	where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep
	where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep
	public where(left: Condition, operator?: LogicalOperator, right?: Condition): SelectWhereStep {
		const whereParts:(LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, left, operator, right)
		return new SelectWhereStep(this.data, this, whereParts)
	}

	public groupBy(...groupByItems: Column[]): GroupByStep {
		return returnStepOrThrow(this.data.step).groupBy(...groupByItems)
	}

	public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this.data, this, orderByItems)
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
