import { OffsetStep } from './select-path/OffsetStep'
import { LimitStep } from './select-path/LimitStep'
import { Condition, Expression, PrimitiveType } from '../models'
import { AliasedTable, BooleanColumn, Column, Table } from '../database'
import { ColumnNotFoundError } from '../errors'
import { BuilderData, SqlPath } from '../builder'
import { All, Asterisk } from '../singletoneConstants'
import { OrderByArgsElement, OrderByDirection, OrderByItem, OrderByItemInfo, OrderByNullsPosition } from '../orderBy'
import { SelectItemInfo } from '../SelectItemInfo'
import { escapeDoubleQuote } from '../util'
import { AggregateFunction } from '../AggregateFunction'
import { Binder } from '../binder'
import { Artifacts, BaseStep, Parenthesis } from './BaseStep'
import { SelectWhereStep } from './select-path/SelectConditionStep'
import { HavingStep } from './HavingStep'
import { CrossJoinStep, GroupByStep } from './stepInterfaces'
import {
	FullOuterJoinStep,
	InnerJoinStep,
	JoinStep,
	LeftJoinStep,
	RightJoinStep,
} from './select-path/BaseJoinStep'
import { LogicalOperator } from '../operators'
import { FromItemRelation } from '../FromItemInfo'
import { OnStep } from './select-path/AfterFromStep'
import { OrderByStep } from './select-path/OrderByStep'
import { DeleteStep } from './delete-path/DeleteStep'
import { ReturningItem, ReturningItemInfo } from '../ReturningItemInfo'
import { ItemInfo } from '../ItemInfo'
import { InsertStep } from './insert-path/InsertStep'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'
import { SetStep } from './update-path/SetStep'
import { UpdateStep } from './update-path/UpdateStep'
import { TableAsterisk } from '../TableAsterisk'
import { SelectStep } from './select-path/SelectStep'
import { SelectFromStep } from './select-path/SelectFromStep'
import { ReturningStep } from './ReturningStep'

export type ColumnLike = Column|Expression
export type SelectItem = ColumnLike|AggregateFunction|Binder|Asterisk|TableAsterisk
export type FromItem = Table|AliasedTable
export type FromItems = [FromItem, ...FromItem[]]

export class Step extends BaseStep
	implements CrossJoinStep, GroupByStep {
	constructor(protected data: BuilderData, protected prevStep: BaseStep) {
		super(data, prevStep)
		data.step = this
	}

	public getStepStatement(): string {
		throw new Error('Method not implemented.')
	}

	protected getStepArtifacts(): Artifacts {
		throw new Error('to be deleted')
	}

	public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		throw new Error('to be deleted')
	}

	public delete(): DeleteStep {
		this.data.sqlPath = SqlPath.DELETE
		return new DeleteStep(this.data, this)
	}

	public insert(): InsertStep {
		this.data.sqlPath = SqlPath.INSERT
		return new InsertStep(this.data, this)
	}

	public update(table: Table): UpdateStep {
		this.data.sqlPath = SqlPath.UPDATE
		// this.data.updateTable = table
		// return this
		throw new Error('to be deleted')
	}

	public from(...tables: FromItems): SelectFromStep {
		throw new Error('to be deleted')
	}

	public crossJoin(table: Table|AliasedTable): CrossJoinStep {
		this.addFromItemInfo(table, FromItemRelation.CROSS_JOIN)
		return this
	}

	public join(table: Table|AliasedTable): JoinStep {
		// this.addFromItemInfo(table, FromItemRelation.JOIN)
		// return this
		throw new Error('to be deleted')
	}

	public leftJoin(table: Table|AliasedTable): LeftJoinStep {
		// this.addFromItemInfo(table, FromItemRelation.LEFT_JOIN)
		// return this
		throw new Error('to be deleted')
	}

	public rightJoin(table: Table|AliasedTable): RightJoinStep {
		// this.addFromItemInfo(table, FromItemRelation.RIGHT_JOIN)
		// return this
		throw new Error('to be deleted')
	}

	public innerJoin(table: Table|AliasedTable): InnerJoinStep {
		// this.addFromItemInfo(table, FromItemRelation.INNER_JOIN)
		// return this
		throw new Error('to be deleted')
	}

	public fullOuterJoin(table: Table|AliasedTable): FullOuterJoinStep {
		// this.addFromItemInfo(table, FromItemRelation.FULL_OUTER_JOIN)
		// return this
		throw new Error('to be deleted')
	}

	public on(condition: Condition): OnStep {
		this.data.fromItemInfos[this.data.fromItemInfos.length - 1].addFirstCondition(condition)
		return new OnStep(this.data, this, condition)
	}

	public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): SelectWhereStep {
		const whereParts:(LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new SelectWhereStep(this.data, this, whereParts)
	}

	public groupBy(...groupByItems: Column[]): GroupByStep {
		this.data.groupByItems.push(...groupByItems)
		return this
	}

	public having(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingStep {
		this.addHavingParts(cond1, op1, cond2, op2, cond3)
		return new HavingStep(this.data, this)
	}

	public orderBy(...orderByArgsElement: OrderByArgsElement[]): OrderByStep {
		if (orderByArgsElement.length === 0) {
			throw new Error('Order by should have at lease one item')
		}
		type StoreType = { orderByItem?: OrderByItem, direction?: OrderByDirection, nullsPos?: OrderByNullsPosition }
		const store: StoreType = { orderByItem: undefined, direction: undefined, nullsPos: undefined }
		const pushWhenOrderByItemDefined = () => {
			if (store.orderByItem !== undefined) {
				this.data.orderByItemInfos.push(new OrderByItemInfo(
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
				this.data.orderByItemInfos.push(it)
			} else if (it instanceof Column) {
				pushWhenOrderByItemDefined()
				store.orderByItem = it
			} else if (it instanceof Expression) {
				pushWhenOrderByItemDefined()
				store.orderByItem = it
			} else { //it is a string
				pushWhenOrderByItemDefined()
				//look for the alias
				if (this.data.selectItemInfos.find(info => info.alias === it)) {
					store.orderByItem = `"${escapeDoubleQuote(it)}"`
				} else {
					throw new Error(`Alias ${it} is not exist, if this is a column, then it should be entered as Column class`)
				}
			}
		})
		pushWhenOrderByItemDefined()
		return new OrderByStep(this.data, this, orderByArgsElement)
	}

	public limit(n: null|number|All): LimitStep {
		throw new Error('to be deleted')
	}

	public limit$(n: null|number): LimitStep {
		throw new Error('to be deleted')
	}

	public offset(n: number): OffsetStep {
		throw new Error('to be deleted')
	}

	public offset$(n: number): OffsetStep {
		throw new Error('to be deleted')
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		throw new Error('will be deleted')
	}

	private throwIfColumnsNotInDb(columns: (ReturningItemInfo|SelectItemInfo|ColumnLike)[]) {
		for (const item of columns) {
			if (
				item instanceof Expression
				|| item instanceof SelectItemInfo
				|| item instanceof ReturningItemInfo
			) {
				this.throwIfColumnsNotInDb(item.getColumns())
				continue
			}
			// after this, item is type Column
			if (!this.data.database.hasColumn(item)) {
				throw new ColumnNotFoundError(`Column: "${item.name}" not found in database`)
			}
		}
	}

	set(...items: UpdateSetItemInfo[]): SetStep {
		// this.data.updateSetItemInfos.push(...items)
		// return new SetStep(this.data, this)
		throw new Error('to be deleted')
	}
}
