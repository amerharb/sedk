import { SelectStep } from './select-path/SelectStep'
import { FromItems, SelectFromStep } from './select-path/SelectFromStep'
import { DeleteStep } from './delete-path/DeleteStep'
import { DeleteFromStep } from './delete-path/DeleteFromStep'
import { InsertStep } from './insert-path/InsertStep'
import { IntoStep } from './insert-path/IntoStep'
import { ItemInfo } from '../ItemInfo'
import { ALL, ASTERISK, All, DISTINCT, Distinct } from '../singletoneConstants'
import { BuilderData } from '../builder'
import { AliasedTable, Column, Table } from '../database'
import { PrimitiveType } from '../models'
import { Artifacts, BaseStep } from './BaseStep'
import { SelectItem } from './Step'
import { UpdateStep } from './update-path/UpdateStep'

export class RootStep extends BaseStep {
	constructor(data: BuilderData) {
		super(data, null)

	}

	public getStepStatement(): string {
		return ''
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
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
		return new InsertStep(this.data, this)
	}

	insertInto(table: Table, ...columns: Column[]): IntoStep {
		return new InsertStep(this.data, this).into(table, ...columns)
	}

	update(table: Table): UpdateStep {
		return new UpdateStep(this.data, this, table)
	}
}
