import { FromItem } from './SelectFromStep.ts'
import { Artifacts, BaseStep, Parenthesis } from '../BaseStep.ts'
import { All } from '../../singletoneConstants.ts'
import { LimitStep } from './LimitStep.ts'
import { OffsetStep } from './OffsetStep.ts'
import { BooleanColumn, Column, Table } from '../../database/index.ts'
import { ItemInfo } from '../../ItemInfo.ts'
import { Condition, PrimitiveType } from '../../models/index.ts'
import { LogicalOperator } from '../../operators.ts'
import { OrderByArgsElement } from '../../orderBy.ts'
import { ReturningItem } from '../../ReturningItemInfo.ts'
import { SelectWhereStep } from './SelectConditionStep.ts'
import { ReturningStep } from '../ReturningStep.ts'
import {
	FullOuterJoinStep,
	InnerJoinStep,
	JoinStep,
	LeftJoinStep,
	RightJoinStep,
} from './BaseJoinStep.ts'
import { OrderByStep } from './OrderByStep.ts'
import { GroupByStep } from './GroupByStep.ts'

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

	getStepArtifacts(): Artifacts {
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

	getStepArtifacts(): Artifacts {
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
