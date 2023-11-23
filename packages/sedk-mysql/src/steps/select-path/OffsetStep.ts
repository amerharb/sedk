import { Binder } from '../../binder'
import { InvalidOffsetValueError } from '../../errors'
import { Artifacts, BaseStep } from '../BaseStep'

export class OffsetStep extends BaseStep {
	private readonly offset: number|Binder
	constructor(
		prevStep: BaseStep,
		offset: number,
		asBinder: boolean = false,
	) {
		super(prevStep)
		if (!Number.isFinite(offset) || offset < 0 || !Number.isInteger(offset)) {
			throw new InvalidOffsetValueError(offset)
		}
		if (asBinder) {
			this.offset = this.binderStore.getBinder(offset)
		} else {
			this.offset = offset
		}
	}

	getStepStatement(): string {
		return `OFFSET ${this.offset}`
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}
}
