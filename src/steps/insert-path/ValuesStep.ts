import { Binder } from '../../binder'
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
		private readonly values: (PrimitiveType|Binder|Default)[],
	) {
		super(prevStep)
		if (values.length === 0) {
			throw new Error('VALUES step must have at least one value')
		}
	}

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
	}

	getStepStatement(): string {
		const valueStringArray = this.values.map(it => {
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
					this.binderStore.add(it)
				}
				return it.getStmt()
			} else if (it instanceof Default) {
				return it.getStmt()
			} else {
				throw new Error(`Value step has Unsupported value: ${it}, type: ${typeof it}`)
			}
		})
		return `VALUES(${valueStringArray.join(', ')})`
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}
}
