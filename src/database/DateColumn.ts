import { Binder, BinderArray } from '../binder'
import { Column, ColumnObj } from './Column'
import {
	Condition,
	DateLike,
	Expression,
	UpdateCondition,
} from '../models'
import { ComparisonOperator, NullOperator } from '../operators'
import { Default } from '../singletoneConstants'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'

export class DateColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|DateLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public eq(value: null|Default): UpdateSetItemInfo
	public eq(value: DateLike): UpdateCondition
	public eq(value: DateLike|null|Default): UpdateCondition|UpdateSetItemInfo {
		if (value === null || value instanceof Default) {
			return new UpdateSetItemInfo(this, value)
		}
		return new UpdateCondition(this, new Expression(value))
	}

	public isEq$(value: null|Date): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public eq$(value: null): UpdateSetItemInfo
	public eq$(value: Date): UpdateCondition
	public eq$(value: Date|null): UpdateCondition|UpdateSetItemInfo {
		const binder = new Binder(value)
		if (value === null) {
			return new UpdateSetItemInfo(this, new Expression(binder))
		}
		return new UpdateCondition(this, new Expression(binder))
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
