import { ItemInfo } from '../../ItemInfo.ts'
import { PrimitiveType } from '../../models/index.ts'
import { ReturningItem } from '../../ReturningItemInfo.ts'
import { Artifacts, BaseStep } from '../BaseStep.ts'
import { ReturningStep } from '../ReturningStep.ts'

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
