import { Binder } from '../../binder'
import { BuilderData } from '../../builder'
import { InvalidOffsetValueError } from '../../errors'
import { ItemInfo } from '../../ItemInfo'
import { PrimitiveType } from '../../models'
import { ReturningItem } from '../../ReturningItemInfo'
import { ReturningStep } from '../ReturningStep'
import { Artifacts, BaseStep } from '../BaseStep'

export class OffsetStep extends BaseStep {
	private readonly value: number|Binder
	public constructor(
		data: BuilderData,
		prevStep: BaseStep,
		value: number,
		asBinder: boolean = false,
	) {
		super(data, prevStep)
		if (!Number.isFinite(value) || value < 0) {
			throw new InvalidOffsetValueError(value)
		}
		if (asBinder) {
			this.value = this.data.binderStore.getBinder(value)
		} else {
			this.value = value
		}
	}

	getStepStatement(): string {
		return `OFFSET ${this.value}`
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this.data, this, items)
	}
}
