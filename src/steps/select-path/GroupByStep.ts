import { BooleanColumn, Column } from '../../database'
import { Condition } from '../../models'
import { LogicalOperator } from '../../operators'
import { OrderByArgsElement } from '../../orderBy'
import { HavingStep } from './HavingStep'
import { OrderByStep } from './OrderByStep'
import { Artifacts, BaseStep, Parenthesis } from '../BaseStep'

export class GroupByStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
		protected readonly groupByItems: ReadonlyArray<Column>,
	) {
		super(prevStep)
		if (groupByItems.length === 0) {
			throw new Error('GroupByStep: groupByItems must not be empty')
		}
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.groupByItems) }
	}

	getStepStatement(): string {
		return `GROUP BY ${this.groupByItems.map(it => it.getStmt(this.data)).join(', ')}`
	}

	having(condition: Condition): HavingStep
	having(left: Condition, operator: LogicalOperator, right: Condition): HavingStep
	having(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingStep
	having(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingStep {
		const havingParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(havingParts, cond1, op1, cond2, op2, cond3)
		return new HavingStep(this, havingParts)
	}

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this, orderByItems)
	}
}
