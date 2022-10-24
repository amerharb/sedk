import { ALL, DISTINCT } from '../singletoneConstants'
import { BuilderData } from '../builder'
import { Table } from '../database'
import { PrimitiveType } from '../models'
import { SelectItemInfo } from '../SelectItemInfo'
import { BaseStep } from './BaseStep'
import { DeleteStep } from './delete-path/DeleteStep'
import { InsertStep } from './InsertStep'
import { SelectItem, Step } from './Step'
import { UpdateStep } from './stepInterfaces'
import { SelectStep } from './select-path/SelectStep'

export class RootStep extends BaseStep {
	constructor(data: BuilderData) {
		super(data, null)

	}

	public getStepStatement(): string {
		return ''
	}

	select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this.data, this, items)
	}

	selectDistinct(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this.data, this, items, DISTINCT)
	}

	selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this.data, this, items, ALL)
	}

	delete(): DeleteStep {
		return new DeleteStep(this.data, this)
	}

	insert(): InsertStep {
		// TODO: code for the new way
		return new Step(this.data, this).insert()
	}

	update(table: Table): UpdateStep {
		// TODO: code for the new way
		return new Step(this.data, this).update(table)
	}
}

