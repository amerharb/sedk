import { Artifacts } from '../steps/BaseStep'
import { INameGiver } from './INameGiver'
import { Table } from './Table'
import { escapeDoubleQuote } from '../util'
import { Condition, IStatementGiver, PrimitiveType, ValueLike } from '../models'
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
import { BuilderData } from '../builder'
import { ItemInfo } from '../ItemInfo'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'
import { DEFAULT } from '../singletoneConstants'
import { EmptyArrayError } from '../errors'

export type ColumnObj = {
	name: string
}

export abstract class Column implements INameGiver, IStatementGiver {
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

	public get fqName(): string {
		return `${this.table.fqName}."${escapeDoubleQuote(this.data.name)}"`
	}

	public getDoubleQuotedName(): string {
		return `"${escapeDoubleQuote(this.data.name)}"`
	}

	public as(alias: string): ItemInfo {
		return new SelectItemInfo(this, alias)
	}

	public get ASC(): OrderByItemInfo {
		return new OrderByItemInfo(this, ASC, NULLS_POSITION_NOT_EXIST)
	}
	public get DESC(): OrderByItemInfo {
		return new OrderByItemInfo(this, DESC, NULLS_POSITION_NOT_EXIST)
	}

	public get NULLS_FIRST(): OrderByItemInfo {
		return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_FIRST)
	}

	public get NULLS_LAST(): OrderByItemInfo {
		return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_LAST)
	}

	public get ASC_NULLS_FIRST(): OrderByItemInfo {
		return new OrderByItemInfo(this, ASC, NULLS_FIRST)
	}

	public get DESC_NULLS_FIRST(): OrderByItemInfo {
		return new OrderByItemInfo(this, DESC, NULLS_FIRST)
	}

	public get ASC_NULLS_LAST(): OrderByItemInfo {
		return new OrderByItemInfo(this, ASC, NULLS_LAST)
	}

	public get DESC_NULLS_LAST(): OrderByItemInfo {
		return new OrderByItemInfo(this, DESC, NULLS_LAST)
	}

	public get eqDEFAULT(): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, DEFAULT)
	}

	public getStmt(data: BuilderData, artifacts: Artifacts): string {
		if (this.mTable === undefined)
			throw new Error('Table of this column is undefined')

		const schemaName = Array
			.from(artifacts.tables)
			.some(it => it !== this.table && it.name === this.table.name)
			? `"${escapeDoubleQuote(this.table.schema.name)}".`
			: ''

		const tableName = (
			data.option.addTableName === 'always'
			|| (data.option.addTableName === 'when two tables or more'
				&& Array.from(artifacts.tables)
					.some(it => it !== this.table))
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
