import { BuilderData } from '../../builder'
import { Column } from '../../database'
import { Condition } from '../../models'
import { LogicalOperator } from '../../operators'
import { OrderByArgsElement } from '../../orderBy'
import { HavingStep } from './HavingStep'
import { OrderByStep } from './OrderByStep'
import { Artifacts, BaseStep } from '../BaseStep'

export class GroupByStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		protected readonly groupByItems: ReadonlyArray<Column>,
	) {
		super(data, prevStep)
		if (groupByItems.length === 0) {
			throw new Error('GroupByStep: groupByItems must not be empty')
		}
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.groupByItems) }
	}

	getStepStatement(artifacts: Artifacts): string {
		return `GROUP BY ${this.groupByItems.map(it => it.getStmt(this.data)).join(', ')}`
	}

	having(condition: Condition): HavingStep
	having(left: Condition, operator: LogicalOperator, right: Condition): HavingStep
	having(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingStep
	having(left: Condition, operator1?: LogicalOperator, middle?: Condition, operator2?: LogicalOperator, right?: Condition): HavingStep {
		throw new Error('Method not implemented.')
	}

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this.data, this, orderByItems)
	}
}
