import { BaseStep } from './BaseStep'
import { ReturnItems, VarLabels } from './types'
import { Asterisk } from '../singletoneConstants'
import { Variable } from '../Variable'
import { MatchStep } from './MatchStep'

export class ReturnStep extends BaseStep {
	public constructor(
		prevStep: MatchStep,
		private readonly items: ReturnItems,
	) {
		super(prevStep)
		checkItemsIsNotEmpty()
		checkItemsAreNotDuplicated()
		checkAsteriskIsLast()
		checkItemsExistInReturn(prevStep.matchItems)
		checkThereIsVariableForAsterisk(prevStep.matchItems)

		function checkItemsIsNotEmpty() {
			if (items.length === 0) {
				throw new Error('At least one variable must be provided')
			}
		}

		function checkItemsAreNotDuplicated() {
			const itemsSet = new Set(items)
			if (items.length !== itemsSet.size) {
				throw new Error('Return item duplicated')
			}
		}

		function checkAsteriskIsLast() {
			if (items.find((item, index) => item instanceof Asterisk && index !== items.length - 1)) {
				throw new Error('Asterisk must be the last item')
			}
		}

		function checkItemsExistInReturn(matchItems?: VarLabels) {
			if (!items
				.filter(it => it instanceof Variable)
				.every(item => matchItems?.some(findItem => findItem === item))) {
				throw new Error('One or more variables are not in the match clause')
			}
		}

		function checkThereIsVariableForAsterisk(matchItems?: VarLabels) {
			if (
				items[items.length - 1] instanceof Asterisk
				&& !matchItems?.some(it => it instanceof Variable)
			) {
				throw new Error('RETURN ASTERISK is not allowed when there are no variables')
			}
		}
	}

	public toString(): string {
		return `RETURN ${this.items.map(it => it.getStmt()).join(', ')}`
	}
}
