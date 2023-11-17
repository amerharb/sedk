import { OffsetStep } from './OffsetStep'
import { Binder } from '../../binder'
import { InvalidLimitValueError } from '../../errors'
import { Artifacts, BaseStep } from '../BaseStep'
import { BaseLimitStep } from './BaseLimitStep'

export class LimitStep extends BaseLimitStep {
	private readonly limit: number|Binder

	constructor(
		prevStep: BaseStep,
		limit: number,
		asBinder: boolean = false,
	) {
		super(prevStep)
		if (!Number.isFinite(limit) || limit < 0 || !Number.isInteger(limit)) {
			throw new InvalidLimitValueError(limit)
		}
		if (asBinder) {
			this.limit = this.binderStore.getBinder(limit)
		} else {
			this.limit = limit
		}
	}

	getStepStatement(): string {
		return `LIMIT ${this.limit}`
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	offset(value: number): OffsetStep {
		return new OffsetStep(this, value)
	}

	offset$(value: number): OffsetStep {
		return new OffsetStep(this, value, true)
	}
}
