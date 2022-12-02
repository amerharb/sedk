import { IntoColumnsStep, IntoTableStep } from '../../steps'
import { InsertColumnsAndValuesNotEqualError } from '../../errors'
import { Binder, BinderStore } from '../../binder'
import { Default } from '../../singletoneConstants'
import { getStmtBoolean, getStmtDate, getStmtNull, getStmtString } from '../../util'
import { ItemInfo } from '../../ItemInfo'
import { PrimitiveType, isNumber } from '../../models'
import { ReturningItem } from '../../ReturningItemInfo'
import { Artifacts, BaseStep } from '../BaseStep'
import { ReturningStep } from '../ReturningStep'

export class ValuesStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
		protected readonly values: (PrimitiveType|Binder|Default)[],
	) {
		super(prevStep)
		if (values.length === 0) {
			throw new Error('ValuesStep step must have at least one value')
		}
		ValuesStep.throwForInvalidValuesNumber(values, prevStep)
		return new Proxy(
			this,
			{ apply: (target: this, thisArg, args: (PrimitiveType|Binder|Default)[]) => target.selfCall(...args) },
		)
	}

	private static throwForInvalidValuesNumber(
		values: (PrimitiveType|Binder|Default)[],
		prevStep: BaseStep,
	) {
		if (prevStep instanceof IntoTableStep) {
			const tables = Array.from(prevStep.getStepArtifacts().tables)
			if (tables.length === 1) {
				const tableColumnCount = tables[0].getColumns().length
				if (values.length !== tableColumnCount) {
					throw new InsertColumnsAndValuesNotEqualError(tableColumnCount, values.length)
				}
			} else {
				throw new Error('Invalid number of tables, IntoStep can have only one table')
			}
		} else if (prevStep instanceof IntoColumnsStep) {
			const columnsCount = prevStep.getStepArtifacts().columns.size
			if (columnsCount === 0) {
				throw new Error('IntoColumnsStep must have at least one column')
			} else if (values.length !== columnsCount) {
				throw new InsertColumnsAndValuesNotEqualError(columnsCount, values.length)
			}
		} else if (prevStep instanceof ValuesStep || prevStep instanceof MoreValuesStep) {
			const valueCount = prevStep.values.length
			if (valueCount === 0) {
				throw new Error('ValuesStep and MoreValuesStep must have at least one value')
			} else if (values.length !== valueCount) {
				throw new InsertColumnsAndValuesNotEqualError(valueCount, values.length)
			}
		} else {
			throw new Error('Invalid previous step')
		}
	}

	private selfCall(...values: (PrimitiveType|Binder|Default)[]): MoreValuesStep {
		return new MoreValuesStep(this, values)
	}

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
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
