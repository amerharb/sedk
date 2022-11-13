import { Binder } from '../../binder'
import { InvalidOffsetValueError } from '../../errors'
import { ItemInfo } from '../../ItemInfo'
import { PrimitiveType } from '../../models'
import { ReturningItem } from '../../ReturningItemInfo'
import { ReturningStep } from '../ReturningStep'
import { Artifacts, BaseStep } from '../BaseStep'

export class OffsetStep extends BaseStep {
	private readonly value: number|Binder
	constructor(
		prevStep: BaseStep,
		value: number,
		asBinder: boolean = false,
	) {
		super(prevStep)
		if (!Number.isFinite(value) || value < 0) {
			throw new InvalidOffsetValueError(value)
		}
		if (asBinder) {
			this.value = this.binderStore.getBinder(value)
		} else {
			this.value = value
		}
	}

	getStepStatement(): string {
		return `OFFSET ${this.value}`
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
	}
}
