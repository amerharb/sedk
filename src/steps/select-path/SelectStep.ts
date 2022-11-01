import { MoreThanOneDistinctOrAllError } from '../../errors'
import { AggregateFunction } from '../../AggregateFunction'
import { Binder } from '../../binder'
import { BuilderData } from '../../builder'
import { Column } from '../../database'
import { ItemInfo } from '../../ItemInfo'
import { Expression, PrimitiveType } from '../../models'
import { ReturningItem } from '../../ReturningItemInfo'
import { SelectItemInfo } from '../../SelectItemInfo'
import { ALL, All, Asterisk, DISTINCT, Distinct } from '../../singletoneConstants'
import { Artifacts, BaseStep } from '../BaseStep'
import { SelectFromStep } from './SelectFromStep'
import { FromItems, SelectItem } from '../Step'
import { ReturningStep } from '../ReturningStep'
import { TableAsterisk } from '../../TableAsterisk'

export class SelectStep extends BaseStep {
	public readonly items: (ItemInfo|SelectItem|PrimitiveType)[]
	private readonly distinct?: Distinct|All

	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		items: (Distinct|All|ItemInfo|SelectItem|PrimitiveType)[],
	) {
		super(data, prevStep)
		if (items[0] instanceof Distinct) {
			if (items.length <= 1) throw new Error('Select step must have at least one parameter after DISTINCT')
			items.shift() //remove first item the DISTINCT item
			// TODO: use this as type guard
			SelectStep.throwIfMoreThanOneDistinctOrAll(items)
			this.items = items as (ItemInfo|SelectItem|PrimitiveType)[]
			this.distinct = DISTINCT
		}

		if (items[0] instanceof All) {
			items.shift() //remove first item the ALL item
			SelectStep.throwIfMoreThanOneDistinctOrAll(items)
			this.items = items as (ItemInfo|SelectItem|PrimitiveType)[]
			this.distinct = ALL
		}

		SelectStep.throwIfMoreThanOneDistinctOrAll(items)
		this.items = items as (ItemInfo|SelectItem|PrimitiveType)[]
	}

	public getStepStatement(artifacts?: Artifacts): string {
		const selectItemInfos: ItemInfo[] = this.items.map(it => {
			if (it instanceof SelectItemInfo || it instanceof ItemInfo) {
				return it
			} else if (
				it instanceof Expression
				|| it instanceof Column
				|| it instanceof AggregateFunction
				|| it instanceof Asterisk
				|| it instanceof TableAsterisk
			) {
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

		if (this.distinct) {
			result += ` ${this.distinct}`
		}

		if (selectItemInfos.length > 0) {
			const selectPartsString = selectItemInfos.map(it => it.getStmt(this.data))
			result += ` ${selectPartsString.join(', ')}`
		}

		return result
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.getColumns()) }
	}

	public getAliases(): string[] {
		return this.items
			.map(it => {
				if (this.isSelectItemInfo(it) && it.alias !== undefined) {
					return it.alias
				}
				return []
			})
			.flat(1)
	}

	from(...tables: FromItems): SelectFromStep {
		return new SelectFromStep(this.data, this, tables)
	}

	// TODO: check if this needed here
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this.data, this, items)
	}

	private getColumns(): Column[] {
		return this.items.map(it => {
			if (it instanceof SelectItemInfo) {
				return it.getColumns()
			} else if (it instanceof ItemInfo) {
				return it.getColumns()
			} else if (it instanceof Expression) {
				return it.getColumns()
			} else if (it instanceof Column) {
				return it
			} else if (it instanceof AggregateFunction) {
				return it.getColumns()
			} else {
				return []
			}
		}).flat()
	}

	private isSelectItemInfo(item: ItemInfo|SelectItem|PrimitiveType): item is SelectItemInfo|ItemInfo {
		return item instanceof SelectItemInfo || item instanceof ItemInfo
	}

	private static throwIfMoreThanOneDistinctOrAll(items: (Distinct|All|ItemInfo|SelectItem|PrimitiveType)[]):
		items is (SelectItemInfo|SelectItem|PrimitiveType)[] {
		items.forEach(it => {
			if (it instanceof Distinct || it instanceof All)
				throw new MoreThanOneDistinctOrAllError('You can not have more than one DISTINCT or ALL')
		})
		return true
	}
}

