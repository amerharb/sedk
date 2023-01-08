import {
	BooleanLike,
	Condition,
	Expression,
	NumberLike,
	OperandType,
	PrimitiveType,
	TextLike,
	isNumber,
} from './models'
import {
	ArithmeticOperator,
	ComparisonOperator,
	NullOperator,
	Operator,
	isComparisonOperator,
} from './operators'
import {
	OrderByDirection,
	OrderByItem,
	OrderByItemInfo,
	OrderByNullsPosition,
} from './orderBy'
import { AggregateFunction, AggregateFunctionEnum } from './AggregateFunction'
import { BooleanColumn, DateColumn, NumberColumn, TextColumn } from './database'
import { Binder } from './binder'

export function e(left: OperandType): Expression
export function e(left: BooleanLike, operator: ComparisonOperator, right: BooleanLike): Condition
export function e(left: BooleanColumn|NumberColumn|TextColumn|DateColumn, operator: NullOperator, right: BooleanLike|null): Condition
export function e(left: NumberLike|Binder, operator: ArithmeticOperator, right: NumberLike|Binder): Expression
export function e(left: TextLike, operator: ComparisonOperator, right: TextLike): Condition
export function e(left: OperandType, operator: Operator, right: OperandType): Expression
export function e(left: OperandType|Binder, operator?: Operator, right?: OperandType|Binder): Expression {
	const l = left instanceof Binder
		? Expression.getSimpleExp(left)
		: left
	if (operator !== undefined && right !== undefined) {
		const r = right instanceof Binder ? Expression.getSimpleExp(right) : right
		if (
			isComparisonOperator(operator)
			&& l instanceof Expression
			&& r instanceof Expression
		) {
			return new Condition({ leftExpression: l, operator, rightExpression: r })
		}
		return Expression.getComplexExp(l, operator, r)
	} else {
		return Expression.getSimpleExp(l)
	}
}

export function o(alias: OrderByItem, direction?: OrderByDirection, nullsPosition?: OrderByNullsPosition): OrderByItemInfo {
	return new OrderByItemInfo(alias, direction, nullsPosition)
}

export function $(value: PrimitiveType): Binder {
	return new Binder(value)
}

export function NOT(condition: Condition): Condition {
	return new Condition({ leftExpression: condition, notLeft: true })
}

export const f = {
	sum: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.SUM, column)
	},

	avg: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.AVG, column)
	},

	count: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.COUNT, column)
	},

	max: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.MAX, column)
	},

	min: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.MIN, column)
	},
}

function aggregateFunction(functionName: AggregateFunctionEnum, column: Expression|NumberLike): AggregateFunction {
	if (column instanceof NumberColumn || isNumber(column))
		return new AggregateFunction(functionName, Expression.getSimpleExp(column))
	else
		return new AggregateFunction(functionName, column)
}
