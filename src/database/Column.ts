import { Table } from './database'
import { escapeDoubleQuote } from '../util'
import { PrimitiveType, ValueLike } from '../models/types'
import { Condition } from '../models/Condition'
import { ComparisonOperator } from '../operators'
import {
	ASC,
	DESC,
	DIRECTION_NOT_EXIST,
	NULLS_FIRST,
	NULLS_LAST,
	NULLS_POSITION_NOT_EXIST,
	OrderByItemInfo,
} from '../orderBy'
import { SelectItemInfo } from '../SelectItemInfo'
import { IStatementGiver } from '../models/IStatementGiver'
import { BuilderData } from '../builder'
import { ItemInfo } from '../ItemInfo'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'
import { DEFAULT } from '../singletoneConstants'
import { EmptyArrayError } from '../errors'

export type ColumnObj = {
	name: string
}

export abstract class Column implements IStatementGiver {
	private mTable?: Table

	protected constructor(protected readonly data: ColumnObj) {}

	public set table(table: Table) {
		if (this.mTable === undefined)
			this.mTable = table
		else
			throw new Error('Table can only be assigned one time')
	}

	public get table(): Table {
		if (this.mTable === undefined)
			throw new Error('Table was not assigned')

		return this.mTable
	}

	public get name(): string {
		return this.data.name
	}

	public getDoubleQuotedName(): string {
		return `"${escapeDoubleQuote(this.data.name)}"`
	}

	public as(alias: string): ItemInfo {
		return new SelectItemInfo(this, alias)
	}

	public get asc(): OrderByItemInfo {
		return new OrderByItemInfo(this, ASC, NULLS_POSITION_NOT_EXIST)
	}

	public get desc(): OrderByItemInfo {
		return new OrderByItemInfo(this, DESC, NULLS_POSITION_NOT_EXIST)
	}

	public get nullsFirst(): OrderByItemInfo {
		return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_FIRST)
	}

	public get nullsLast(): OrderByItemInfo {
		return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_LAST)
	}

	public get ascNullsFirst(): OrderByItemInfo {
		return new OrderByItemInfo(this, ASC, NULLS_FIRST)
	}

	public get descNullsFirst(): OrderByItemInfo {
		return new OrderByItemInfo(this, DESC, NULLS_FIRST)
	}

	public get ascNullsLast(): OrderByItemInfo {
		return new OrderByItemInfo(this, ASC, NULLS_LAST)
	}

	public get descNullsLast(): OrderByItemInfo {
		return new OrderByItemInfo(this, DESC, NULLS_LAST)
	}

	/** @deprecated - since v0.15.0 use eqDEFAULT */
	public get letDefault(): UpdateSetItemInfo {
		return this.eqDEFAULT
	}

	public get eqDEFAULT(): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, DEFAULT)
	}

	public getStmt(data: BuilderData): string {
		if (this.mTable === undefined)
			throw new Error('Table of this column is undefined')

		const schemaName = data.fromItemInfos.some(it => (it.table !== this.table && it.table.name === this.table.name))
			? `"${escapeDoubleQuote(this.table.schema.name)}".`
			: ''

		const tableName = (
			data.option.addTableName === 'always'
			|| (data.option.addTableName === 'when two tables or more'
				&& data.fromItemInfos.some(it => it.table !== this.table))
		) ? `"${escapeDoubleQuote(this.table.name)}".` : ''

		return `${schemaName}${tableName}"${escapeDoubleQuote(this.data.name)}"`
	}

	public abstract in(...values: ValueLike[]): Condition

	public abstract in$(...values: PrimitiveType[]): Condition

	public abstract notIn(...values: ValueLike[]): Condition

	public abstract notIn$(...values: PrimitiveType[]): Condition

	protected static throwIfArrayIsEmpty(arr: ValueLike[], operator: ComparisonOperator): void {
		if (arr.length === 0) throw new EmptyArrayError(operator)
	}
}
