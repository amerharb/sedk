import { Column } from '../../database'
import { OrderByArgsElement } from '../../orderBy'
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

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.groupByItems) }
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `GROUP BY ${this.groupByItems.map(it => it.getStmt(this.data, artifacts)).join(', ')}`
	}

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this, orderByItems)
	}
}
