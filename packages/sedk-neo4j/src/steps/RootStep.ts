import { BaseStep } from './BaseStep'
import { Variable } from '../Variable'
import { Label } from '../Label'
import { MatchStep } from './MatchStep'
import { VarLabels } from './types'

export class RootStep extends BaseStep {
	constructor() {
		super(null)
	}
	public match(variable: Variable): MatchStep
	public match(...labels: Label[]): MatchStep
	public match(...varLabels: VarLabels): MatchStep
	public match(...varLabels: VarLabels): MatchStep {
		return new MatchStep(this, varLabels)
	}

	public toString(): string {
		return ''
	}
}
