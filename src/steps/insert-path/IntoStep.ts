import { Column, Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'
import { PrimitiveType } from '../../models'
import { DefaultValuesStep } from './DefaultValuesStep'
import { InsertColumnsAndExpressionsNotEqualError } from '../../errors'
import { Binder } from '../../binder'
import { SelectItem, SelectStep } from '../select-path/SelectStep'
import { SelectItemInfo } from '../../SelectItemInfo'
import { Default } from '../../singletoneConstants'
import { ValuesStep } from './ValuesStep'

export abstract class IntoStep extends BaseStep {
	public values(...values: (PrimitiveType|Binder|Default)[]): ValuesStep {
		return new ValuesStep(this, values)
	}

	public values$(...values: PrimitiveType[]): ValuesStep {
		return new ValuesStep(this, values.map(it => new Binder(it)))
	}

	public defaultValues(): DefaultValuesStep {
		return new DefaultValuesStep(this)
	}

	public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		// TODO: consider adding DISTINCT and ALL to items without effecting matching number of values
		if (items.length === 0) {
			throw new Error('Invalid empty SELECT step')
		}
		this.throwForInvalidExpressionsNumber(items)
		return new SelectStep(this, items)
	}

	private throwForInvalidExpressionsNumber(items: (SelectItemInfo|SelectItem|PrimitiveType)[]) {
		// TODO: in case columnCount = 0 we should check number of column in schema
		const columnsCount = this.getStepArtifacts().columns.size ?? 0
		if (columnsCount > 0 && columnsCount !== items.length) {
			throw new InsertColumnsAndExpressionsNotEqualError(columnsCount, items.length)
		}
	}
}

export class IntoTableStep extends IntoStep {
	constructor(
		prevStep: BaseStep,
		private readonly table: Table,
	) {
		super(prevStep)
		this.throwIfTableNotInDb(table)
		return new Proxy(
			this,
			{ apply: (target, thisArg, args) => target.selfCall(...args) },
		)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `INTO ${this.table.getStmt(this.data, artifacts)}`
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set([this.table]), columns: new Set() }
	}

	private selfCall(...columns: Column[]): IntoColumnsStep {
		return new IntoColumnsStep(this, columns)
	}
}

export class IntoColumnsStep extends IntoStep {
	override prefixSeparator = ''
	constructor(
		prevStep: BaseStep,
		private readonly columns: Column[],
	) {
		super(prevStep)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `(${this.columns.map(it => it.getDoubleQuotedName()).join(', ')})`
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.columns) }
	}
}
