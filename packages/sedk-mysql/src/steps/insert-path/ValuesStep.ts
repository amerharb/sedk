import { IntoColumnsStep, IntoStep, IntoTableStep } from '../../steps'
import { InsertColumnsAndValuesNotEqualError } from '../../errors'
import { Binder, BinderStore } from '../../binder'
import { Default } from '../../singletoneConstants'
import { getStmtBoolean, getStmtDate, getStmtNull, getStmtString } from '../../util'
import { PrimitiveType, isNumber } from '../../models'
import { Artifacts, BaseStep } from '../BaseStep'

export class ValuesStep extends BaseStep {
	constructor(
		prevStep: IntoStep|ValuesStep,
		protected readonly values: [(PrimitiveType|Binder|Default), ...(PrimitiveType|Binder|Default)[]],
	) {
		super(prevStep)
		if (values.length === 0) {
			throw new Error('ValuesStep step must have at least one value')
		}
		ValuesStep.throwForInvalidValuesNumber(values, prevStep)
		return new Proxy(
			this,
			{ apply: (target: this, thisArg, args: [(PrimitiveType|Binder|Default), ...(PrimitiveType|Binder|Default)[]]) => target.selfCall(...args) },
		)
	}

	private static throwForInvalidValuesNumber(
		values: (PrimitiveType|Binder|Default)[],
		prevStep: IntoStep|ValuesStep,
	) {
		if (prevStep instanceof IntoTableStep) {
			const tableColumnCount = prevStep.table.getColumns().length
			if (values.length !== tableColumnCount) {
				throw new InsertColumnsAndValuesNotEqualError(tableColumnCount, values.length)
			}
		} else if (prevStep instanceof IntoColumnsStep) {
			const columnsCount = prevStep.columns.length
			if (columnsCount === 0) {
				throw new Error('IntoColumnsStep must have at least one column')
			} else if (values.length !== columnsCount) {
				throw new InsertColumnsAndValuesNotEqualError(columnsCount, values.length)
			}
		} else if (prevStep instanceof ValuesStep) {
			const valueCount = prevStep.values.length
			if (values.length !== valueCount) {
				throw new InsertColumnsAndValuesNotEqualError(valueCount, values.length)
			}
		} else {
			throw new Error('Invalid previous step')
		}
	}

	private selfCall(...values: [(PrimitiveType|Binder|Default), ...(PrimitiveType|Binder|Default)[]]): MoreValuesStep {
		return new MoreValuesStep(this, values)
	}

	getStepStatement(): string {
		const valueStringArray = getValueStringArray(this.values, this.binderStore)
		return `VALUES(${valueStringArray.join(', ')})`
	}

	public getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}
}

export class MoreValuesStep extends ValuesStep {
	override readonly prefixSeparator = ''

	constructor(
		prevStep: ValuesStep,
		values: [(PrimitiveType|Binder|Default), ...(PrimitiveType|Binder|Default)[]],
	) {
		super(prevStep, values)
	}

	override getStepStatement(): string {
		const valueStringArray = getValueStringArray(this.values, this.binderStore)
		return `,(${valueStringArray.join(', ')})`
	}
}

function getValueStringArray(values: (PrimitiveType|Binder|Default)[], binderStore: BinderStore): string[] {
	return values.map(it => {
		if (it === null) {
			return getStmtNull()
		} else if (typeof it === 'boolean') {
			return getStmtBoolean(it)
		} else if (isNumber(it)) {
			return it.toString()
		} else if (typeof it === 'string') {
			return getStmtString(it)
		} else if (it instanceof Date) {
			return getStmtDate(it)
		} else if (it instanceof Binder) {
			if (it.no === undefined) {
				binderStore.add(it)
			}
			return it.getStmt()
		} else if (it instanceof Default) {
			return it.getStmt()
		} else {
			throw new Error(`Value step has Unsupported value: ${it}, type: ${typeof it}`)
		}
	})
}
