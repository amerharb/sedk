import { OffsetStep } from './OffsetStep.ts'
import { All } from '../../singletoneConstants.ts'
import { Binder } from '../../binder.ts'
import { InvalidLimitValueError } from '../../errors.ts'
import { ItemInfo } from '../../ItemInfo.ts'
import { PrimitiveType } from '../../models/index.ts'
import { ReturningItem } from '../../ReturningItemInfo.ts'
import { ReturningStep } from '../ReturningStep.ts'
import { Artifacts, BaseStep } from '../BaseStep.ts'

export class LimitStep extends BaseStep {
	private readonly value: null|number|Binder|All

	constructor(
		prevStep: BaseStep,
		value: null|number|All,
		asBinder: boolean = false,
	) {
		super(prevStep)
		if (typeof value === 'number' && (!Number.isFinite(value) || value < 0)) {
			throw new InvalidLimitValueError(value)
		}
		if (asBinder) {
			if (value instanceof All) {
				throw new Error('ALL cannot be used as binder')
			}
			this.value = this.binderStore.getBinder(value)
		} else {
			this.value = value
		}
	}

	getStepStatement(): string {
		if (this.value === null) {
			return `LIMIT NULL`
		}
		return `LIMIT ${this.value}`
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

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
	}
}
