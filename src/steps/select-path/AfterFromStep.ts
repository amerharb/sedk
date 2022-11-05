import { FromItem } from './SelectFromStep'
import { Artifacts, BaseStep, Parenthesis } from '../BaseStep'
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
import { GroupByStep } from './GroupByStep'

export abstract class AfterFromStep extends BaseStep {
	public crossJoin(fromItem: FromItem): CrossJoinStep {
		return new CrossJoinStep(this, fromItem)
	}

	public leftJoin(fromItem: FromItem): LeftJoinStep {
		return new LeftJoinStep(this, fromItem)
	}

	public rightJoin(fromItem: FromItem): RightJoinStep {
		return new RightJoinStep(this, fromItem)
	}

	public fullOuterJoin(fromItem: FromItem): FullOuterJoinStep {
		return new FullOuterJoinStep(this, fromItem)
	}

	public innerJoin(fromItem: FromItem): InnerJoinStep {
		return new InnerJoinStep(this, fromItem)
	}

	public join(fromItem: FromItem): JoinStep {
		return new JoinStep(this, fromItem)
	}

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

	limit(n: number|All|null): LimitStep {
		return new LimitStep(this, n)
	}

	limit$(n: number|null): LimitStep {
		return new LimitStep(this, n, true)
	}

	offset(n: number): OffsetStep {
		return new OffsetStep(this, n)
	}

	offset$(n: number): OffsetStep {
		return new OffsetStep(this, n, true)
	}

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this, orderByItems)
	}

	// TODO: check if we can limit this to only update, insert and delete
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
	}
}

export class CrossJoinStep extends AfterFromStep {
	constructor(
		prevStep: BaseStep,
		private readonly fromItem: FromItem,
	) {
		super(prevStep)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `CROSS JOIN ${this.fromItem.getStmt(this.data, artifacts)}`
	}

	protected getStepArtifacts(): Artifacts {
		const table = this.fromItem instanceof Table ? this.fromItem : this.fromItem.table
		return { tables: new Set([table]), columns: new Set() }
	}
}

export class OnStep extends AfterFromStep {
	constructor(
		prevStep: BaseStep,
		protected readonly condition: Condition,
	) {
		super(prevStep)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `ON ${this.condition.getStmt(this.data, artifacts, this.binderStore)}`
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.condition.getColumns()) }
	}

	public or(condition: Condition): OnOrStep {
		return new OnOrStep(this, condition)
	}

	public and(condition: Condition): OnAndStep {
		return new OnAndStep(this, condition)
	}
}

export class OnAndStep extends OnStep {
	override getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `AND ${this.condition.getStmt(this.data, artifacts, this.binderStore)}`
	}
}

export class OnOrStep extends OnStep {
	override getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `OR ${this.condition.getStmt(this.data, artifacts, this.binderStore)}`
	}
}
