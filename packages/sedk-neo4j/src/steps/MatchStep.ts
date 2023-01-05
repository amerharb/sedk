import { BaseStep } from './BaseStep'
import { ReturnStep } from './ReturnStep'
import { ReturnItems, VarLabels } from './types'
import { Variable } from '../Variable'
import { RootStep } from './RootStep'

export class MatchStep extends BaseStep {
	constructor(prevStep: RootStep, public readonly matchItems: VarLabels) {
		super(prevStep)
		if (matchItems.length === 0) {
			throw new Error('No variable or labels provided')
		}
	}

	public toString(): string {
		const matchArray = this.matchItems.map(it => it.getStmt())
		if (!(this.matchItems[0] instanceof Variable)) {
			matchArray.unshift('')
		}

		return `MATCH (${matchArray.join(':')})`
	}

	public return(...items: ReturnItems): ReturnStep {
		return new ReturnStep(this, items)
	}
}
