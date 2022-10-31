import { Column } from 'Non-Exported/database'
import {
	OrderByArgsElement,
	OrderByDirection,
	OrderByItem,
	OrderByItemInfo,
	OrderByNullsPosition,
} from 'Non-Exported/orderBy'
import { escapeDoubleQuote } from 'Non-Exported/util'
import { BuilderData } from '../../builder'
import { ItemInfo } from '../../ItemInfo'
import { Expression, PrimitiveType } from '../..//models'
import { ReturningItem } from '../../ReturningItemInfo'
import { All } from '../../singletoneConstants'
import { Artifacts, BaseStep } from '../BaseStep'
import { LimitStep } from './LimitStep'
import { OffsetStep } from './OffsetStep'
import { ReturningStep } from '../ReturningStep'

export class OrderByStep extends BaseStep {
	private readonly orderByItemInfos: OrderByItemInfo[] = []
	public constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly orderByArgsElement: OrderByArgsElement[],
	) {
		super(data, prevStep)
		if (orderByArgsElement.length === 0) {
			throw new Error('Order by should have at lease one item')
		}
		type StoreType = { orderByItem?: OrderByItem, direction?: OrderByDirection, nullsPos?: OrderByNullsPosition }
		const store: StoreType = { orderByItem: undefined, direction: undefined, nullsPos: undefined }
		const pushWhenOrderByItemDefined = () => {
			if (store.orderByItem !== undefined) {
				this.orderByItemInfos.push(new OrderByItemInfo(
					store.orderByItem,
					store.direction,
					store.nullsPos,
				))
				store.orderByItem = undefined
				store.direction = undefined
				store.nullsPos = undefined
			}
		}

		orderByArgsElement.forEach(it => {
			if (it instanceof OrderByDirection) {
				if (store.orderByItem === undefined)
					throw new Error(`${it} expects to have column or alias before it`)
				if (store.direction !== undefined)
					throw new Error(`${it} shouldn't come after "ASC" or "DESC" without column or alias in between`)
				store.direction = it
			} else if (it instanceof OrderByNullsPosition) {
				if (store.orderByItem === undefined)
					throw new Error(`${it} expects to have column or alias before it`)
				if (store.nullsPos !== undefined)
					throw new Error(`${it} shouldn't come directly after "NULLS FIRST" or "NULLS LAST" without column or alias in between`)
				store.nullsPos = it
				pushWhenOrderByItemDefined()
			} else if (it instanceof OrderByItemInfo) {
				pushWhenOrderByItemDefined()
				this.orderByItemInfos.push(it)
			} else if (it instanceof Column) {
				pushWhenOrderByItemDefined()
				store.orderByItem = it
			} else if (it instanceof Expression) {
				pushWhenOrderByItemDefined()
				store.orderByItem = it
			} else { //it is a string
				pushWhenOrderByItemDefined()
				// TODO: remove this.data, replace this with logic that check artifacts
				//look for the alias
				if (this.data.selectItemInfos.find(info => info.alias === it)) {
					store.orderByItem = `"${escapeDoubleQuote(it)}"`
				} else {
					throw new Error(`Alias ${it} is not exist, if this is a column, then it should be entered as Column class`)
				}
			}
		})
		pushWhenOrderByItemDefined()
	}

	protected getStepArtifacts(): Artifacts {
		const columns = this.orderByArgsElement
			.map(it => {
				if (it instanceof Column) {
					return it
				} else if (it instanceof Expression) {
					return it.getColumns()
				} else {
					return []
				}
			})
			.flat(1)
		return { tables: new Set(), columns: new Set(columns) }
	}

	getStepStatement(artifacts: Artifacts): string {
		if (this.orderByItemInfos.length > 0) {
			const orderByPartsString = this.orderByItemInfos.map(it => {
				return it.getStmt(this.data)
			})
			return `ORDER BY ${orderByPartsString.join(', ')}`
		}
		return ''
	}

	public limit(n: null|number|All): LimitStep {
		return new LimitStep(this.data, this, n)
	}

	public limit$(n: null|number): LimitStep {
		return new LimitStep(this.data, this, n, true)
	}

	public offset(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n)
	}

	public offset$(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n, true)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this.data, this, items)
	}
}
