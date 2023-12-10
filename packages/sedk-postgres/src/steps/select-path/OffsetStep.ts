import { Binder } from '../../binder.ts'
import { InvalidOffsetValueError } from '../../errors.ts'
import { ItemInfo } from '../../ItemInfo.ts'
import { PrimitiveType } from '../../models/index.ts'
import { ReturningItem } from '../../ReturningItemInfo.ts'
import { ReturningStep } from '../ReturningStep.ts'
import { Artifacts, BaseStep } from '../BaseStep.ts'

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
