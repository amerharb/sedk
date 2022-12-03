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
	public values(value: (PrimitiveType|Binder|Default), ...values: (PrimitiveType|Binder|Default)[]): ValuesStep
	public values(...values: (PrimitiveType|Binder|Default)[]): ValuesStep {
		return new ValuesStep(this, values)
	}

	public values$(value: PrimitiveType, ...values: PrimitiveType[]): ValuesStep
	public values$(...values: PrimitiveType[]): ValuesStep {
		return new ValuesStep(this, values.map(it => new Binder(it)))
	}

	public defaultValues(): DefaultValuesStep {
		return new DefaultValuesStep(this)
	}

	public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		// TODO: consider adding DISTINCT and ALL to items without effecting matching number of values
		// TODO: consider adding ASTERISK and Table Asterisk to items without throwing error if matching column number
		if (items.length === 0) {
			throw new Error('Invalid empty SELECT step')
		}
		this.throwWhenInvalidExpressionsNumber(items)
		return new SelectStep(this, items)
	}

	protected abstract throwWhenInvalidExpressionsNumber(items: (SelectItemInfo|SelectItem|PrimitiveType)[]): void
}

export class IntoTableStep extends IntoStep {
	constructor(
		prevStep: BaseStep,
		public readonly table: Table,
	) {
		super(prevStep)
		this.throwIfTableNotInDb(table)
		return new Proxy(
			this,
			{ apply: (target: this, thisArg, args: Column[]) => target.selfCall(...args) },
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

	protected throwWhenInvalidExpressionsNumber(items: (SelectItemInfo|SelectItem|PrimitiveType)[]): void {
		const tableColumnCount = this.table.getColumns().length
		if (items.length !== tableColumnCount) {
			throw new InsertColumnsAndExpressionsNotEqualError(tableColumnCount, items.length)
		}
	}
}

export class IntoColumnsStep extends IntoStep {
	override prefixSeparator = ''

	constructor(
		prevStep: BaseStep,
		public readonly columns: Column[],
	) {
		super(prevStep)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `(${this.columns.map(it => it.getDoubleQuotedName()).join(', ')})`
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.columns) }
	}

	protected throwWhenInvalidExpressionsNumber(items: (SelectItemInfo|SelectItem|PrimitiveType)[]): void {
		const columnsCount = this.getStepArtifacts().columns.size
		if (columnsCount === 0) {
			throw new Error('IntoColumnsStep must have at least one column')
		} else if (items.length !== columnsCount) {
			throw new InsertColumnsAndExpressionsNotEqualError(columnsCount, items.length)
		}
	}
}
