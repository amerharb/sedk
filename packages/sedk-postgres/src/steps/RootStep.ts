import { SelectItem, SelectStep } from './select-path/SelectStep.ts'
import { FromItem, FromItems, SelectFromStep } from './select-path/SelectFromStep.ts'
import { DeleteStep } from './delete-path/DeleteStep.ts'
import { DeleteFromStep } from './delete-path/DeleteFromStep.ts'
import { InsertStep } from './insert-path/InsertStep.ts'
import { IntoColumnsStep, IntoStep, IntoTableStep } from './insert-path/IntoStep.ts'
import { ItemInfo } from '../ItemInfo.ts'
import { ALL, ASTERISK, All, DISTINCT, Distinct } from '../singletoneConstants.ts'
import { BuilderData } from '../builder.ts'
import { Column, Table } from '../database/index.ts'
import { PrimitiveType } from '../models/index.ts'
import { Artifacts, BaseStep } from './BaseStep.ts'
import { UpdateStep } from './update-path/UpdateStep.ts'

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

	delete(): DeleteStep {
		return new DeleteStep(this)
	}

	deleteFrom(fromItem: FromItem): DeleteFromStep {
		return new DeleteStep(this).from(fromItem)
	}

	insert(): InsertStep {
		return new InsertStep(this)
	}

	insertInto(table: Table): IntoTableStep
	insertInto(table: Table, ...columns: Column[]): IntoColumnsStep
	insertInto(table: Table, ...columns: Column[]): IntoStep {
	  if (columns.length === 0) {
			return new InsertStep(this).into(table)
		}
		return new InsertStep(this).into(table, ...columns)
	}

	update(table: Table): UpdateStep {
		return new UpdateStep(this, table)
	}
}
