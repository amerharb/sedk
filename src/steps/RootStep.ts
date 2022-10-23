import { BuilderData } from '../builder'
import { Table } from '../database'
import { PrimitiveType } from '../models'
import { SelectItemInfo } from '../SelectItemInfo'
import { BaseStep } from './BaseStep'
import { DeleteStep } from './DeleteStep'
import { InsertStep } from './InsertStep'
import { SelectItem, Step } from './Step'
import { SelectStep, UpdateStep } from './stepInterfaces'

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
		return new Step(this.data, this).selectDistinct(...items)
	}

	selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new Step(this.data, this).selectAll(...items)
	}

	delete(): DeleteStep {
		return new Step(this.data, this).delete()
	}

	insert(): InsertStep {
		return new Step(this.data, this).insert()
	}

	update(table: Table): UpdateStep {
		return new Step(this.data, this).update(table)
	}
}

