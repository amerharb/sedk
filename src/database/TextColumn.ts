import { Binder, BinderArray } from '../binder'
import { Column, ColumnObj } from '../database/columns'
import { Condition, UpdateCondition } from '../models/Condition'
import { Expression } from '../models/Expression'
import { TextLike } from '../models/types'
import { ComparisonOperator, NullOperator, TextOperator } from '../operators'
import { Default } from '../singletoneConstants'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'

export class TextColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|string|TextColumn): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public eq(value: string|TextColumn|Expression): UpdateCondition
	public eq(value: null|Default): UpdateSetItemInfo
	public eq(value: string|TextColumn|Expression|null|Default): UpdateCondition|UpdateSetItemInfo {
		if (value instanceof Expression) {
			return new UpdateCondition(this, value)
		} else if (value === null || value instanceof Default) {
			return new UpdateSetItemInfo(this, value)
		}
		return new UpdateCondition(this, new Expression(value))
	}

	public isEq$(value: null|string): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public eq$(value: string): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(binder))
	}

	public isNe(value: null|string|TextColumn): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public ne(value: string|TextColumn|Expression): Condition {
		if (value instanceof Expression) {
			return new Condition(new Expression(this), ComparisonOperator.NotEqual, value)
		}
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value))
	}

	public isNe$(value: null|string): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public ne$(value: string): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(binder))
	}

	public concat(value: TextLike): Expression {
		return new Expression(this, TextOperator.CONCAT, value)
	}

	/** @deprecated - since v.0.15.0 use eq() */
	public let(value: string|null|Default): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, value)
	}

	public let$(value: string|null): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, new Binder(value))
	}

	public in(...values: TextLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		return new Condition(new Expression(this), ComparisonOperator.In, new Expression(values))
	}

	public in$(...values: string[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition(new Expression(this), ComparisonOperator.In, new Expression(binderArray))
	}

	public notIn(...values: TextLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		return new Condition(new Expression(this), ComparisonOperator.NotIn, new Expression(values))
	}

	public notIn$(...values: string[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition(new Expression(this), ComparisonOperator.NotIn, new Expression(binderArray))
	}
}

