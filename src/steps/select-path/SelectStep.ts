import { AggregateFunction } from '../../AggregateFunction'
import { Binder } from '../../binder'
import { BuilderData } from '../../builder'
import { Column } from '../../database'
import { ItemInfo } from '../../ItemInfo'
import { Expression, PrimitiveType } from '../../models'
import { ReturningItem } from '../../ReturningItemInfo'
import { SelectItemInfo } from '../../SelectItemInfo'
import { Asterisk } from '../../singletoneConstants'
import { BaseStep } from '../BaseStep'
import { FromItems, SelectFromStep, SelectItem, Step } from '../../steps'
import { ReturningStep } from '../../steps/stepInterfaces'
import { TableAsterisk } from '../../TableAsterisk'

export class SelectStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly items: (SelectItemInfo|SelectItem|PrimitiveType)[]) {
		super(data, prevStep)
	}

	from(...tables: FromItems): SelectFromStep {
		return new Step(this.data, this).from(...tables)
	}

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new Step(this.data, this).returning(...items)
	}

	getStepStatement(): string {
		const selectItemInfos: SelectItemInfo[] = this.items.map(it => {
			if (it instanceof SelectItemInfo) {
				return it
			} else if (it instanceof Expression || it instanceof Column || it instanceof AggregateFunction || it instanceof Asterisk || it instanceof TableAsterisk) {
				return new SelectItemInfo(it, undefined)
			} else if (it instanceof Binder) {
				if (it.no === undefined) {
					this.data.binderStore.add(it)
				}
				return new SelectItemInfo(it, undefined)
			} else {
				return new SelectItemInfo(new Expression(it), undefined)
			}
		})
		// this.throwIfColumnsNotInDb(selectItemInfos)
		this.data.selectItemInfos.push(...selectItemInfos)

		let result = `SELECT`

		if (this.data.distinct) {
			result += ` ${this.data.distinct}`
		}

		if (this.data.selectItemInfos.length > 0) {
			const selectPartsString = this.data.selectItemInfos.map(it => {
				return it.getStmt(this.data)
			})
			result += ` ${selectPartsString.join(', ')}`
		}

		return result
	}
}

