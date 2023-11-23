import { Binder } from '../../binder'
import { InvalidLimitValueError, InvalidOffsetValueError } from '../../errors'
import { BaseStep } from '../BaseStep'
import { BaseLimitStep } from './BaseLimitStep'

export class LimitWithOffsetStep extends BaseLimitStep {
	private readonly offset: number|Binder
	private readonly limit: number|Binder

	constructor(
		prevStep: BaseStep,
		offset: number,
		limit: number,
		asBinder: boolean = false,
	) {
		super(prevStep)
		if (!Number.isFinite(offset) || offset < 0 || !Number.isInteger(offset)) {
			throw new InvalidOffsetValueError(offset)
		}
		if (!Number.isFinite(limit) || limit < 0 || !Number.isInteger(limit)) {
			throw new InvalidLimitValueError(limit)
		}
		if (asBinder) {
			this.offset = this.binderStore.getBinder(offset)
			this.limit = this.binderStore.getBinder(limit)
		} else {
			this.offset = offset
			this.limit = limit
		}
	}

	getStepStatement(): string {
		return `LIMIT ${this.offset}, ${this.limit}`
	}
}
