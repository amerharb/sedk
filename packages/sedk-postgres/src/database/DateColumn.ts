import { Binder, BinderArray } from '../binder.ts'
import { Column, ColumnObj } from './Column.ts'
import {
	Condition,
	DateLike,
	Expression,
	UpdateCondition,
} from '../models/index.ts'
import { ComparisonOperator, NullOperator } from '../operators.ts'
import { Default } from '../singletoneConstants.ts'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo.ts'

export class DateColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|DateLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public eq(value: null|Default): UpdateSetItemInfo
	public eq(value: DateLike): UpdateCondition
	public eq(value: DateLike|null|Default): UpdateCondition|UpdateSetItemInfo {
		if (value === null || value instanceof Default) {
			return new UpdateSetItemInfo(this, value)
		}
		return new UpdateCondition(this, Expression.getSimpleExp(value))
	}

	public isEq$(value: null|Date): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public eq$(value: null): UpdateSetItemInfo
	public eq$(value: Date): UpdateCondition
	public eq$(value: Date|null): UpdateCondition|UpdateSetItemInfo {
		const binder = new Binder(value)
		if (value === null) {
			return new UpdateSetItemInfo(this, Expression.getSimpleExp(binder))
		}
		return new UpdateCondition(this, Expression.getSimpleExp(binder))
	}

	public isNe(value: null|DateLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public ne(value: DateLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public isNe$(value: null|Date): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public ne$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public gt(value: DateLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterThan,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public gt$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterThan,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public ge(value: DateLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterOrEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public ge$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterOrEqual,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public lt(value: DateLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserThan,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public lt$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserThan,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public le(value: DateLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserOrEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public le$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserOrEqual,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	/** @deprecated - since v0.15.0 use eq() */
	public let(value: Date|null|Default): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, value)
	}

	/** @deprecated - since v0.15.0 use eq$() */
	public let$(value: Date|null): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, new Binder(value))
	}

	public in(...values: DateLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.In,
			rightExpression: Expression.getSimpleExp(values),
		})
	}

	public in$(...values: Date[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.In,
			rightExpression: Expression.getSimpleExp(binderArray),
		})
	}

	public notIn(...values: DateLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: Expression.getSimpleExp(values),
		})
	}

	public notIn$(...values: Date[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: Expression.getSimpleExp(binderArray),
		})
	}
}
