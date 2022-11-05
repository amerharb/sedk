import { SelectItem, SelectStep } from './select-path/SelectStep'
import { FromItem, FromItems, SelectFromStep } from './select-path/SelectFromStep'
import { DeleteStep } from './delete-path/DeleteStep'
import { DeleteFromStep } from './delete-path/DeleteFromStep'
import { InsertStep } from './insert-path/InsertStep'
import { IntoStep } from './insert-path/IntoStep'
import { ItemInfo } from '../ItemInfo'
import { ALL, ASTERISK, All, DISTINCT, Distinct } from '../singletoneConstants'
import { BuilderData } from '../builder'
import { Column, Table } from '../database'
import { PrimitiveType } from '../models'
import { Artifacts, BaseStep } from './BaseStep'
import { UpdateStep } from './update-path/UpdateStep'

export class RootStep extends BaseStep {
	constructor(protected readonly data: BuilderData) {
		super(null)
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

	delete(): DeleteStep {
		return new DeleteStep(this)
	}

	deleteFrom(fromItem: FromItem): DeleteFromStep {
		return new DeleteStep(this).from(fromItem)
	}

	insert(): InsertStep {
		return new InsertStep(this)
	}

	insertInto(table: Table, ...columns: Column[]): IntoStep {
		return new InsertStep(this).into(table, ...columns)
	}

	update(table: Table): UpdateStep {
		return new UpdateStep(this, table)
	}
}
