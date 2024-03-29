import { Binder, BinderArray } from '../binder'
import { Column, ColumnObj } from './Column'
import {
	Condition,
	Expression,
	TextLike,
	UpdateCondition,
} from '../models'
import { ComparisonOperator, NullOperator, TextOperator } from '../operators'
import { Default } from '../singletoneConstants'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'

export class TextColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|string|TextColumn): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public eq(value: Expression): UpdateCondition
	public eq(value: string|TextColumn): UpdateCondition
	public eq(value: null|Default): UpdateSetItemInfo
	public eq(value: string|TextColumn|Expression|null|Default): UpdateCondition|UpdateSetItemInfo {
		if (value instanceof Expression) {
			return new UpdateCondition(this, value)
		} else if (value === null || value instanceof Default) {
			return new UpdateSetItemInfo(this, value)
		}
		return new UpdateCondition(this, Expression.getSimpleExp(value))
	}

	public isEq$(value: null|string): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public eq$(value: null): UpdateSetItemInfo
	public eq$(value: string): UpdateCondition
	public eq$(value: string|null): UpdateCondition|UpdateSetItemInfo {
		const binder = new Binder(value)
		if (value === null) {
			return new UpdateSetItemInfo(this, Expression.getSimpleExp(binder))
		}
		return new UpdateCondition(this, Expression.getSimpleExp(binder))
	}

	public isNe(value: null|string|TextColumn): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public ne(value: Expression): Condition
	public ne(value: string|TextColumn): Condition
	public ne(value: string|TextColumn|Expression): Condition {
		if (value instanceof Expression) {
			return new Condition({
				leftExpression: Expression.getSimpleExp(this),
				operator: ComparisonOperator.NotEqual,
				rightExpression: value,
			})
		}
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public isNe$(value: null|string): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public ne$(value: string): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public concat(value: TextLike): Expression {
		return Expression.getComplexExp(this, TextOperator.CONCAT, value)
	}

	public in(...values: TextLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.In,
			rightExpression: Expression.getSimpleExp(values),
		})
	}

	public in$(...values: string[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.In,
			rightExpression: Expression.getSimpleExp(binderArray),
		})
	}

	public notIn(...values: TextLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: Expression.getSimpleExp(values),
		})
	}

	public notIn$(...values: string[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: Expression.getSimpleExp(binderArray),
		})
	}
}

