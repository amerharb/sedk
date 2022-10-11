import { Table } from './database'
import { escapeDoubleQuote } from '../util'
import { Binder, BinderArray } from '../binder'
import { DateLike, PrimitiveType, ValueLike } from '../models/types'
import { Condition } from '../models/Condition'
import { Expression } from '../models/Expression'
import { ComparisonOperator, NullOperator } from '../operators'
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
import { DEFAULT, Default } from '../singletoneConstants'
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

	public get letDefault(): UpdateSetItemInfo {
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

export class DateColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|DateLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public eq(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(value))
	}

	public isEq$(value: null|Date): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public eq$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(binder))
	}

	public isNe(value: null|DateLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public ne(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value))
	}

	public isNe$(value: null|Date): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public ne$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(binder))
	}

	public gt(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(value))
	}

	public gt$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(binder))
	}

	public ge(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(value))
	}

	public ge$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(binder))
	}

	public lt(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(value))
	}

	public lt$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(binder))
	}

	public le(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(value))
	}

	public le$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(binder))
	}

	public let(value: Date|null|Default): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, value)
	}

	public let$(value: Date|null): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, new Binder(value))
	}

	public in(...values: DateLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		return new Condition(new Expression(this), ComparisonOperator.In, new Expression(values))
	}

	public in$(...values: Date[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition(new Expression(this), ComparisonOperator.In, new Expression(binderArray))
	}

	public notIn(...values: DateLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		return new Condition(new Expression(this), ComparisonOperator.NotIn, new Expression(values))
	}

	public notIn$(...values: Date[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition(new Expression(this), ComparisonOperator.NotIn, new Expression(binderArray))
	}
}
