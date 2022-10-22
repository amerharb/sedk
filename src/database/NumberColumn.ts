import { AggregateFunction, AggregateFunctionEnum } from '../AggregateFunction'
import { Binder, BinderArray } from '../binder'
import { Column, ColumnObj } from './Column'
import {
	Condition,
	Expression,
	NumberLike,
	UpdateCondition,
} from '../models'
import { BitwiseOperator, ComparisonOperator, NullOperator, Operator } from '../operators'
import { Default } from '../singletoneConstants'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'

export class NumberColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|NumberLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public eq(value: null|Default): UpdateSetItemInfo
	public eq(value: NumberLike): UpdateCondition
	public eq(value1: NumberLike, op: Operator, value2: NumberLike): Condition
	public eq(value1: NumberLike|null|Default, op?: Operator, value2?: NumberLike): Condition|UpdateCondition|UpdateSetItemInfo {
		if (value1 === null || value1 instanceof Default) {
			return new UpdateSetItemInfo(this, value1)
		} else if (op !== undefined && value2 !== undefined) {
			return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(value1, op, value2))
		} else {
			return new UpdateCondition(this, new Expression(value1))
		}
	}

	public isEq$(value: null|number): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public eq$(value: null): UpdateSetItemInfo
	public eq$(value: number): UpdateCondition
	public eq$(value: number|null): UpdateCondition|UpdateSetItemInfo {
		const binder = new Binder(value)
		if (value === null) {
			return new UpdateSetItemInfo(this, new Expression(binder))
		}
		return new UpdateCondition(this, new Expression(binder))
	}

	public isNe(value: null|NumberLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public ne(value1: NumberLike): Condition
	public ne(value1: NumberLike, op: Operator, value2: NumberLike): Condition
	public ne(value1: NumberLike, op?: Operator, value2?: NumberLike): Condition {
		const rightExpression = (op !== undefined && value2 !== undefined)
			? new Expression(value1, op, value2)
			: new Expression(value1)

		return new Condition(new Expression(this), ComparisonOperator.NotEqual, rightExpression)
	}

	public isNe$(value: null|number): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public gt(value: NumberLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(value))
	}

	public gt$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(binder))
	}

	public ge(value: NumberLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(value))
	}

	public ge$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(binder))
	}

	public lt(value: NumberLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(value))
	}

	public lt$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(binder))
	}

	public le(value: NumberLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(value))
	}

	public le$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(binder))
	}

	public in(...values: NumberLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		return new Condition(new Expression(this), ComparisonOperator.In, new Expression(values))
	}

	public in$(...values: number[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition(new Expression(this), ComparisonOperator.In, new Expression(binderArray))
	}

	public notIn(...values: NumberLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		return new Condition(new Expression(this), ComparisonOperator.NotIn, new Expression(values))
	}

	public notIn$(...values: number[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition(new Expression(this), ComparisonOperator.NotIn, new Expression(binderArray))
	}

	public bitwiseAnd(value: number): Expression {
		return new Expression(this, BitwiseOperator.BitwiseAnd, value)
	}

	public bitwiseAnd$(value: number): Expression {
		const binder = new Binder(value)
		return new Expression(this, BitwiseOperator.BitwiseAnd, new Expression(binder))
	}

	public bitwiseOr(value: number): Expression {
		return new Expression(this, BitwiseOperator.BitwiseOr, value)
	}

	public bitwiseOr$(value: number): Expression {
		const binder = new Binder(value)
		return new Expression(this, BitwiseOperator.BitwiseOr, new Expression(binder))
	}

	public bitwiseXor(value: number): Expression {
		return new Expression(this, BitwiseOperator.BitwiseXor, value)
	}

	public bitwiseXor$(value: number): Expression {
		const binder = new Binder(value)
		return new Expression(this, BitwiseOperator.BitwiseXor, new Expression(binder))
	}

	public get sum(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.SUM, new Expression(this))
	}

	public get avg(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.AVG, new Expression(this))
	}

	public get count(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.COUNT, new Expression(this))
	}

	public get max(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.MAX, new Expression(this))
	}

	public get min(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.MIN, new Expression(this))
	}

	/** @deprecated - since v0.15.0 use eq() */
	public let(value: number|null|Default): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, value)
	}

	/** @deprecated - since v0.15.0 use eq$() */
	public let$(value: number|null): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, new Binder(value))
	}
}
