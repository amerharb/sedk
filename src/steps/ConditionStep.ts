import { BooleanColumn } from '../database'
import { BaseStep, Parenthesis } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition, Expression } from '../models'
import { LogicalOperator } from '../operators'

export abstract class ConditionStep extends BaseStep {
	protected constructor(
		protected readonly conditionName: 'WHERE' | 'AND' | 'OR',
		data: BuilderData,
		prevStep: BaseStep,
		protected readonly whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super(data, prevStep)
	}

	getStepStatement(): string {
		if (this.whereParts.length > 0) {
			BaseStep.throwIfConditionPartsInvalid(this.whereParts)
			const wherePartsString = this.whereParts.map(it => {
				if (it instanceof Condition || it instanceof Expression || it instanceof BooleanColumn) {
					return it.getStmt(this.data)
				}
				return it.toString()
			})
			return `${this.conditionName} ${wherePartsString.join(' ')}`
		}
		return ''
	}
}
