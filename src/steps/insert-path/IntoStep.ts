import { Column, Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'
import { BuilderData } from '../../builder'
import { PrimitiveType } from '../../models'
import { DefaultValuesStep } from './DefaultValuesStep'
import { InsertColumnsAndExpressionsNotEqualError, InsertColumnsAndValuesNotEqualError } from '../../errors'
import { Binder } from '../../binder'
import { SelectStep } from '../select-path/SelectStep'
import { SelectItemInfo } from '../../SelectItemInfo'
import { SelectItem } from '../Step'
import { Default } from '../../singletoneConstants'
import { ValuesStep } from './ValuesStep'

export class IntoStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly table: Table,
		private readonly columns: Column[] = [],
	) {
		super(data, prevStep)
		this.throwIfTableNotInDb(table)
	}

	public getStepStatement(): string {
		let result =  `INTO ${this.table.getStmt(this.data)}`
		if (this.columns.length > 0) {
			result += `(${this.columns.map(it => it.getDoubleQuotedName()).join(', ')})`
		}
		return result
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}

	public values(...values: (PrimitiveType|Binder|Default)[]): ValuesStep {
		this.throwForInvalidValuesNumber(values)
		return new ValuesStep(this.data, this, values)
	}

	public values$(...values: PrimitiveType[]): ValuesStep {
		this.throwForInvalidValuesNumber(values)
		return new ValuesStep(this.data, this, values.map(it => new Binder(it)))
	}

	public defaultValues(): DefaultValuesStep {
		return new DefaultValuesStep(this.data, this)
	}

	public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		this.throwForInvalidExpressionsNumber(items)
		return new SelectStep(this.data, this, items)
	}

	private throwForInvalidValuesNumber(values: (PrimitiveType|Binder|Default)[]) {
		const columnsCount = this.columns.length
		if (columnsCount > 0 && columnsCount !== values.length) {
			throw new InsertColumnsAndValuesNotEqualError(columnsCount, values.length)
		}
	}

	private throwForInvalidExpressionsNumber(items: (SelectItemInfo|SelectItem|PrimitiveType)[]) {
		const columnsCount = this.columns.length
		if (columnsCount > 0 && columnsCount !== items.length) {
			throw new InsertColumnsAndExpressionsNotEqualError(columnsCount, items.length)
		}
	}
}
