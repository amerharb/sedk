import { TableAsterisk } from '../../TableAsterisk'
import { getMinOneArray } from '../../util'
import { Column, Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'
import { PrimitiveType } from '../../models'
import { InsertColumnsAndExpressionsNotEqualError } from '../../errors'
import { Binder } from '../../binder'
import { SelectItem, SelectStep } from '../select-path/SelectStep'
import { SelectItemInfo } from '../../SelectItemInfo'
import { Asterisk, Default } from '../../singletoneConstants'
import { ValuesStep } from './ValuesStep'

export abstract class IntoStep extends BaseStep {
	public values(value: (PrimitiveType|Binder|Default), ...values: (PrimitiveType|Binder|Default)[]): ValuesStep
	public values(...values: (PrimitiveType|Binder|Default)[]): ValuesStep {
		return new ValuesStep(this, getMinOneArray(values))
	}

	public values$(value: PrimitiveType, ...values: PrimitiveType[]): ValuesStep
	public values$(...values: PrimitiveType[]): ValuesStep {
		return new ValuesStep(this, getMinOneArray(values.map(it => new Binder(it))))
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
		if (items.find(it => it instanceof Asterisk)) {
			/** Validation can not be done when asterisk is used because it is unknown which table(s) is used */
			return
		}
		const expCount = countExpressions(items)

		const tableColumnCount = this.table.getColumns().length
		if (expCount !== tableColumnCount) {
			throw new InsertColumnsAndExpressionsNotEqualError(tableColumnCount, expCount)
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
		if (items.find(it => it instanceof Asterisk)) {
			/** Validation can not be done when asterisk is used because it is unknown which table(s) is used */
			return
		}
		const expCount = countExpressions(items)
		const columnsCount = this.getStepArtifacts().columns.size
		if (columnsCount === 0) {
			throw new Error('IntoColumnsStep must have at least one column')
		} else if (expCount !== columnsCount) {
			throw new InsertColumnsAndExpressionsNotEqualError(columnsCount, expCount)
		}
	}
}

function countExpressions(items: (SelectItemInfo|SelectItem|PrimitiveType)[]): number {
	let expCount = 0
	items.forEach(it => {
		if (it instanceof TableAsterisk) {
			expCount += it.table.getColumns().length
		} else {
			expCount += 1
		}
	})
	return expCount
}
