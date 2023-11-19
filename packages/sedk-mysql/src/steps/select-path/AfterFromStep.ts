import { BaseStep, Parenthesis } from '../BaseStep'
import { BooleanColumn, Column } from '../../database'
import { Condition } from '../../models'
import { LogicalOperator } from '../../operators'
import { OrderByArgsElement } from '../../orderBy'
import { SelectWhereStep } from './SelectConditionStep'
import { OrderByStep } from './OrderByStep'
import { GroupByStep } from './GroupByStep'
import { Artifacts } from '../BaseStep'
import { FromItem } from './SelectFromStep'
import { InnerJoinStep, JoinStep, LeftJoinStep, RightJoinStep } from './BaseJoinStep'
import { LimitStep } from './LimitStep'
import { LimitWithOffsetStep } from './LimitWithOffsetStep'
import { BaseLimitStep } from './BaseLimitStep'
import { OffsetStep } from './OffsetStep'

export abstract class AfterFromStep extends BaseStep {
	public leftJoin(fromItem: FromItem): LeftJoinStep {
		return new LeftJoinStep(this, fromItem)
	}

	public rightJoin(fromItem: FromItem): RightJoinStep {
		return new RightJoinStep(this, fromItem)
	}

	public innerJoin(fromItem: FromItem): InnerJoinStep {
		return new InnerJoinStep(this, fromItem)
	}

	public join(fromItem: FromItem): JoinStep {
		return new JoinStep(this, fromItem)
	}


	public limit(limit: number): LimitStep
	public limit(offset: number, limit: number): LimitWithOffsetStep
	public limit(offsetOrLimit: number, limit: number | undefined = undefined): BaseLimitStep {
		if (limit === undefined) {
			return new LimitStep(this, offsetOrLimit)
		}
		return new LimitWithOffsetStep(this, offsetOrLimit, limit)
	}

	public limit$(limit: number): LimitStep
	public limit$(offset: number, limit: number): LimitWithOffsetStep
	public limit$(offsetOrLimit: number, limit: number | undefined = undefined): BaseLimitStep {
		if (limit === undefined) {
			return new LimitStep(this, offsetOrLimit, true)
		}
		return new LimitWithOffsetStep(this, offsetOrLimit, limit, true)
	}

	public offset(value: number): OffsetStep {
		return new OffsetStep(this, value)
	}

	public offset$(value: number): OffsetStep {
		return new OffsetStep(this, value, true)
	}

	public where(condition: Condition): SelectWhereStep
	public where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep
	public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep
	public where(condition: Condition, operator?: LogicalOperator, middle?: Condition, operator2?: LogicalOperator, right?: Condition): SelectWhereStep {
		const whereParts: (Condition | LogicalOperator | BooleanColumn | Parenthesis)[] = []
		BaseStep.addConditionParts(whereParts, condition, operator, middle, operator2, right)
		return new SelectWhereStep(this, whereParts)
	}

	public groupBy(...groupByItems: Column[]): GroupByStep {
		return new GroupByStep(this, groupByItems)
	}

	public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this, orderByItems)
	}
}

export class OnStep extends AfterFromStep {
	constructor(
		prevStep: BaseStep,
		protected readonly condition: Condition,
	) {
		super(prevStep)
	}

	override getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
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
