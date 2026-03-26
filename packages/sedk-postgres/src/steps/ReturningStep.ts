import { RootStep } from './RootStep.ts'
import { SelectStep } from './select-path/SelectStep.ts'
import { AggregateFunction } from '../AggregateFunction.ts'
import { Binder } from '../binder.ts'
import { Column } from '../database/index.ts'
import { ItemInfo } from '../ItemInfo.ts'
import { Expression, PrimitiveType } from '../models/index.ts'
import { SelectItemInfo } from '../SelectItemInfo.ts'
import { Asterisk } from '../singletoneConstants.ts'
import { TableAsterisk } from '../TableAsterisk.ts'
import { ReturningItem, ReturningItemInfo } from '../ReturningItemInfo.ts'
import { Artifacts, BaseStep } from './BaseStep.ts'

export class ReturningStep extends BaseStep {
	private readonly returningItemInfo: ReturningItemInfo[]

	constructor(
		prevStep: BaseStep,
		returningItems: (ItemInfo|ReturningItem|PrimitiveType)[],
	) {
		super(prevStep)
		if (returningItems.length === 0) {
			throw new Error('RETURNING step items cannot be empty')
		}
		// find first step and check if it is Select
		let step: BaseStep|null = prevStep
		while (step !== null && !(step.prevStep instanceof RootStep)) {
			step = step.prevStep
		}
		if (step instanceof SelectStep) {
			throw new Error('Returning step can not be used in SELECT statement, It can be only use if the path start with INSERT, DELETE, or UPDATE')
		}
		const returningItemInfo: ReturningItemInfo[] = returningItems.map(it => {
			if (it instanceof ReturningItemInfo) {
				return it
			} else if (it instanceof Expression || it instanceof Column || it instanceof Asterisk || it instanceof TableAsterisk) {
				return new ReturningItemInfo(it, undefined)
			} else if (it instanceof Binder) {
				if (it.no === undefined) {
					this.binderStore.add(it)
				}
				return new ReturningItemInfo(it, undefined)
			} else if (it instanceof SelectItemInfo) {
				if (it.selectItem instanceof AggregateFunction) {
					throw new Error(`Aggregate function ${it.selectItem.funcName} cannot be used in RETURNING clause`)
				} else {
					return new ReturningItemInfo(it.selectItem, it.alias)
				}
			} else if (it instanceof ItemInfo) { // not possible as long as ItemInfo is an abstract class
				throw new Error('ItemInfo is an abstract class')
			} else { //it from here is a PrimitiveType
				return new ReturningItemInfo(Expression.getSimpleExp(it), undefined)
			}
		})
		this.throwIfColumnsNotInDb(returningItemInfo)
		this.returningItemInfo = returningItemInfo
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		const returningPartsString = this.returningItemInfo.map(it => {
			return it.getStmt(this.data, artifacts, this.binderStore)
		})
		return `RETURNING ${returningPartsString.join(', ')}`
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.returningItemInfo.map(it => it.getColumns()).flat(1)) }
	}
}
