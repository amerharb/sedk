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
			throw new Error('VALUES step must have at least one value')
		}
		return new Proxy(this, {
			apply: (target, thisArg, args) => target.selfCall(...args),
		})
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

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}
}

export class MoreValuesStep extends ValuesStep {
	constructor(prevStep: BaseStep, values: (PrimitiveType|Binder|Default)[]) {
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
