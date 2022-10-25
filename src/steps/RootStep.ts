import { ItemInfo } from 'Non-Exported/ItemInfo'
import { DeleteFromStep } from 'Non-Exported/steps/delete-path/DeleteFromStep'
import { IntoStep } from 'Non-Exported/steps/IntoStep'
import { SelectFromStep } from 'Non-Exported/steps/select-path/SelectFromStep'
import { ALL, ASTERISK, All, DISTINCT, Distinct } from '../singletoneConstants'
import { BuilderData } from '../builder'
import { AliasedTable, Column, Table } from '../database'
import { PrimitiveType } from '../models'
import { BaseStep } from './BaseStep'
import { DeleteStep } from './delete-path/DeleteStep'
import { InsertStep } from './InsertStep'
import { FromItems, SelectItem, Step } from './Step'
import { UpdateStep } from './stepInterfaces'
import { SelectStep } from './select-path/SelectStep'

export class RootStep extends BaseStep {
	constructor(data: BuilderData) {
		super(data, null)

	}

	public getStepStatement(): string {
		return ''
	}

	public select(distinct: Distinct|All, ...items: (ItemInfo|SelectItem|PrimitiveType)[]): SelectStep
	public select(...items: (ItemInfo|SelectItem|PrimitiveType)[]): SelectStep
	public select(...items: (Distinct|All|ItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this.data, this, items)
	}

	selectDistinct(...items: (ItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this.data, this, [DISTINCT, ...items])
	}

	selectAll(...items: (ItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this.data, this, [ALL, ...items])
	}

	selectAsteriskFrom(...tables: FromItems): SelectFromStep {
		return new SelectStep(this.data, this, [ASTERISK]).from(...tables)
	}

	delete(): DeleteStep {
		return new DeleteStep(this.data, this)
	}

	deleteFrom(table: Table|AliasedTable): DeleteFromStep {
		return new DeleteStep(this.data, this).from(table)
	}

	insert(): InsertStep {
		// TODO: code for the new way
		return new Step(this.data, this).insert()
	}

	insertInto(table: Table, ...columns: Column[]): IntoStep {
		// TODO: code for the new way
		return new Step(this.data, this).insert().into(table, ...columns)
	}

	update(table: Table): UpdateStep {
		// TODO: code for the new way
		return new Step(this.data, this).update(table)
	}
}

