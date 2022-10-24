import { OffsetStep } from './OffsetStep'
import { All } from '../../singletoneConstants'
import { Binder } from '../../binder'
import { BuilderData } from '../../builder'
import { InvalidLimitValueError } from '../../errors'
import { ItemInfo } from '../../ItemInfo'
import { PrimitiveType } from '../../models'
import { ReturningItem } from '../../ReturningItemInfo'
import { ReturningStep } from '../ReturningStep'
import { BaseStep } from '../BaseStep'

export class LimitStep extends BaseStep {
	private readonly value: null|number|Binder|All

	public constructor(
		data: BuilderData,
		prevStep: BaseStep,
		value: null|number|All,
		asBinder: boolean = false,
	) {
		super(data, prevStep)
		if (typeof value === 'number' && (!Number.isFinite(value) || value < 0)) {
			throw new InvalidLimitValueError(value)
		}
		if (asBinder) {
			if (value instanceof All) {
				throw new Error('ALL cannot be used as binder')
			}
			this.value = this.data.binderStore.getBinder(value)
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

	offset(value: number): OffsetStep {
		return new OffsetStep(this.data, this, value)
	}

	offset$(value: number): OffsetStep {
		return new OffsetStep(this.data, this, value, true)
	}

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this.data, this, items)
	}
}