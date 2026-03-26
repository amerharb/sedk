import { AggregateFunction, AggregateFunctionEnum } from '../AggregateFunction.ts'
import { Binder, BinderArray } from '../binder.ts'
import { Column, ColumnObj } from './Column.ts'
import {
	Condition,
	Expression,
	NumberLike,
	UpdateCondition,
} from '../models/index.ts'
import { BitwiseOperator, ComparisonOperator, NullOperator, Operator } from '../operators.ts'
import { Default } from '../singletoneConstants.ts'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo.ts'

export class NumberColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|NumberLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public eq(value: null|Default): UpdateSetItemInfo
	public eq(value: NumberLike): UpdateCondition
	public eq(value1: NumberLike, op: Operator, value2: NumberLike): Condition
	public eq(value1: NumberLike|null|Default, op?: Operator, value2?: NumberLike): Condition|UpdateCondition|UpdateSetItemInfo {
		if (value1 === null || value1 instanceof Default) {
			return new UpdateSetItemInfo(this, value1)
		} else if (op !== undefined && value2 !== undefined) {
			return new Condition({
				leftExpression: Expression.getSimpleExp(this),
				operator: ComparisonOperator.Equal,
				rightExpression: Expression.getComplexExp(value1, op, value2),
			})
		} else {
			return new UpdateCondition(this, Expression.getSimpleExp(value1))
		}
	}

	public isEq$(value: null|number): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public eq$(value: null): UpdateSetItemInfo
	public eq$(value: number): UpdateCondition
	public eq$(value: number|null): UpdateCondition|UpdateSetItemInfo {
		const binder = new Binder(value)
		if (value === null) {
			return new UpdateSetItemInfo(this, Expression.getSimpleExp(binder))
		}
		return new UpdateCondition(this, Expression.getSimpleExp(binder))
	}

	public isNe(value: null|NumberLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public ne(value1: NumberLike): Condition
	public ne(value1: NumberLike, op: Operator, value2: NumberLike): Condition
	public ne(value1: NumberLike, op?: Operator, value2?: NumberLike): Condition {
		const rightExpression = (op !== undefined && value2 !== undefined)
			? Expression.getComplexExp(value1, op, value2)
			: Expression.getSimpleExp(value1)

		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: rightExpression,
		})
	}

	public isNe$(value: null|number): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public gt(value: NumberLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterThan,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public gt$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterThan,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public ge(value: NumberLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterOrEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public ge$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterOrEqual,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public lt(value: NumberLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserThan,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public lt$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserThan,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public le(value: NumberLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserOrEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public le$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserOrEqual,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public in(...values: NumberLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.In,
			rightExpression: Expression.getSimpleExp(values),
		})
	}

	public in$(...values: number[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.In,
			rightExpression: Expression.getSimpleExp(binderArray),
		})
	}

	public notIn(...values: NumberLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: Expression.getSimpleExp(values),
		})
	}

	public notIn$(...values: number[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: Expression.getSimpleExp(binderArray),
		})
	}

	public bitwiseAnd(value: number): Expression {
		return Expression.getComplexExp(this, BitwiseOperator.BitwiseAnd, value)
	}

	public bitwiseAnd$(value: number): Expression {
		const binder = new Binder(value)
		return Expression.getComplexExp(this, BitwiseOperator.BitwiseAnd, Expression.getSimpleExp(binder))
	}

	public bitwiseOr(value: number): Expression {
		return Expression.getComplexExp(this, BitwiseOperator.BitwiseOr, value)
	}

	public bitwiseOr$(value: number): Expression {
		const binder = new Binder(value)
		return Expression.getComplexExp(this, BitwiseOperator.BitwiseOr, Expression.getSimpleExp(binder))
	}

	public bitwiseXor(value: number): Expression {
		return Expression.getComplexExp(this, BitwiseOperator.BitwiseXor, value)
	}

	public bitwiseXor$(value: number): Expression {
		const binder = new Binder(value)
		return Expression.getComplexExp(this, BitwiseOperator.BitwiseXor, Expression.getSimpleExp(binder))
	}

	public get sum(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.SUM, Expression.getSimpleExp(this))
	}

	public get avg(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.AVG, Expression.getSimpleExp(this))
	}

	public get count(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.COUNT, Expression.getSimpleExp(this))
	}

	public get max(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.MAX, Expression.getSimpleExp(this))
	}

	public get min(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.MIN, Expression.getSimpleExp(this))
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
