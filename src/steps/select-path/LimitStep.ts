import { OffsetStep } from './OffsetStep'
import { All } from '../../singletoneConstants'
import { Binder } from '../../binder'
import { InvalidLimitValueError } from '../../errors'
import { ItemInfo } from '../../ItemInfo'
import { PrimitiveType } from '../../models'
import { ReturningItem } from '../../ReturningItemInfo'
import { ReturningStep } from '../ReturningStep'
import { Artifacts, BaseStep } from '../BaseStep'

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

	protected getStepArtifacts(): Artifacts {
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
