import { BaseStep, Parenthesis } from '../BaseStep'
import { BooleanColumn, Column } from '../../database'
import { Condition } from '../../models'
import { LogicalOperator } from '../../operators'
import { OrderByArgsElement } from '../../orderBy'
import { SelectWhereStep } from './SelectConditionStep'
import { OrderByStep } from './OrderByStep'
import { GroupByStep } from './GroupByStep'
import { Artifacts } from "../BaseStep";

export abstract class AfterFromStep extends BaseStep {
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

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
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
