import { SelectItem, SelectStep } from './select-path/SelectStep'
import { FromItems, SelectFromStep } from './select-path/SelectFromStep'
import { ItemInfo } from '../ItemInfo'
import { ALL, ASTERISK, All, DISTINCT, Distinct } from '../singletoneConstants'
import { BuilderData } from '../builder'
import { PrimitiveType } from '../models'
import { Artifacts, BaseStep } from './BaseStep'

export class RootStep extends BaseStep {
	constructor(protected readonly data: BuilderData) {
		super(null)
	}

	public getStepStatement(): string {
		return ''
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	public select(distinct: Distinct|All, ...items: (ItemInfo|SelectItem|PrimitiveType)[]): SelectStep
	public select(...items: (ItemInfo|SelectItem|PrimitiveType)[]): SelectStep
	public select(...items: (Distinct|All|ItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this, items)
	}

	selectDistinct(...items: (ItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this, [DISTINCT, ...items])
	}

	selectAll(...items: (ItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this, [ALL, ...items])
	}

	selectAsteriskFrom(...tables: FromItems): SelectFromStep {
		return new SelectStep(this, [ASTERISK]).from(...tables)
	}
}
