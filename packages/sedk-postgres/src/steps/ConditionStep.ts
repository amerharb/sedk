import { BooleanColumn, Column } from '../database'
import { Artifacts, BaseStep, Parenthesis } from './BaseStep'
import { Condition, Expression } from '../models'
import { LogicalOperator } from '../operators'

export abstract class ConditionStep extends BaseStep {
	protected constructor(
		protected readonly conditionName: 'WHERE'|'HAVING'|'AND'|'OR',
		prevStep: BaseStep,
		protected readonly whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super(prevStep)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		if (this.whereParts.length > 0) {
			BaseStep.throwIfConditionPartsInvalid(this.whereParts)
			const wherePartsString = this.whereParts.map(it => {
				if (it instanceof Condition || it instanceof Expression || it instanceof BooleanColumn) {
					return it.getStmt(this.data, artifacts, this.binderStore)
				}
				return it.toString()
			})
			return `${this.conditionName} ${wherePartsString.join(' ')}`
		}
		return ''
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.getColumns()) }
	}

	private getColumns(): Column[] {
		return this.whereParts.map(it => {
			if (it instanceof BooleanColumn) {
				return it
			} else if (it instanceof Condition) {
				return it.getColumns()
			} else {
				return []
			}
		}).flat(1)
	}
}
