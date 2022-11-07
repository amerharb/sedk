import { ItemInfo } from '../../ItemInfo'
import { PrimitiveType } from '../../models'
import { ReturningItem } from '../../ReturningItemInfo'
import { Artifacts, BaseStep } from '../BaseStep'
import { ReturningStep } from '../ReturningStep'

export class DefaultValuesStep extends BaseStep {
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
	}

	getStepStatement(): string {
		return 'DEFAULT VALUES'
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}
}
