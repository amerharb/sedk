import { Column, Table } from 'Non-Exported/database'
import { BaseStep } from '../BaseStep'
import { BuilderData } from '../../builder'
import { PrimitiveType } from '../../models'
import { DefaultValuesStep } from '../stepInterfaces'
import { InsertColumnsAndExpressionsNotEqualError, InsertColumnsAndValuesNotEqualError } from '../../errors'
import { Binder } from '../../binder'
import { SelectStep } from '../select-path/SelectStep'
import { returnStepOrThrow } from '../../util'
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

	public values(...values: (PrimitiveType|Binder|Default)[]): ValuesStep {
		this.throwForInvalidValuesNumber(values)
		this.data.insertIntoValues.push(...values)
		return returnStepOrThrow(this.data.step)
	}

	public values$(...values: PrimitiveType[]): ValuesStep {
		this.throwForInvalidValuesNumber(values)
		this.data.insertIntoValues.push(...values.map(it => new Binder(it)))
		return returnStepOrThrow(this.data.step)
	}

	public defaultValues(): DefaultValuesStep {
		this.data.insertIntoDefaultValues = true
		return returnStepOrThrow(this.data.step)
	}

	public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		this.throwForInvalidExpressionsNumber(items)
		return returnStepOrThrow(this.data.step).select(...items)
	}

	private throwForInvalidValuesNumber(values: (PrimitiveType|Binder|Default)[]) {
		const columnsCount = this.data.insertIntoColumns.length
		if (columnsCount > 0 && columnsCount !== values.length) {
			throw new InsertColumnsAndValuesNotEqualError(columnsCount, values.length)
		}
	}

	private throwForInvalidExpressionsNumber(items: (SelectItemInfo|SelectItem|PrimitiveType)[]) {
		const columnsCount = this.data.insertIntoColumns.length
		if (columnsCount > 0 && columnsCount !== items.length) {
			throw new InsertColumnsAndExpressionsNotEqualError(columnsCount, items.length)
		}
	}
}
