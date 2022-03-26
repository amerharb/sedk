import {
  BooleanLike,
  NumberLike,
  TextLike,
  Condition,
  Expression,
  OperandType,
  TextBoolean,
} from './models'
import {
  ArithmeticOperator,
  ComparisonOperator,
  Operator,
} from './operators'
import {
  OrderByDirection,
  OrderByNullsPosition,
  OrderByItem,
  OrderByItemInfo,
} from './orderBy'
import { AggregateFunction, AggregateFunctionEnum } from './aggregateFunction'
import { NumberColumn } from './columns'
import { Binder } from './binder'
import { PrimitiveType } from './steps/steps'

export function e(left: OperandType): Expression
export function e(left: BooleanLike, operator: ComparisonOperator, right: BooleanLike|TextBoolean): Condition
export function e(left: NumberLike|Binder, operator: ArithmeticOperator, right: NumberLike|Binder): Expression
export function e(left: TextLike, operator: ComparisonOperator, right: TextLike): Condition
export function e(left: OperandType, operator: Operator, right: OperandType|TextBoolean): Expression
export function e(left: OperandType|Binder, operator?: Operator, right?: OperandType|Binder): Expression {
  const l = left instanceof Binder ? new Expression(left) : left
  if (operator !== undefined && right !== undefined) {
    const r = right instanceof Binder ? new Expression(right) : right
    if (
      Object.values(ComparisonOperator).includes(operator as ComparisonOperator)
      && l instanceof Expression
      && r instanceof Expression
    ) {
      return new Condition(l, operator as ComparisonOperator, r)
    }
    return new Expression(l, operator, r)
  } else {
    return new Expression(l)
  }
}

export function o(alias: OrderByItem, direction?: OrderByDirection, nullsPosition?: OrderByNullsPosition): OrderByItemInfo {
  return new OrderByItemInfo(alias, direction, nullsPosition)
}

export function $(value: PrimitiveType): Binder {
  return new Binder(value)
}

export const f = {
  sum: (column: Expression|NumberLike): AggregateFunction => {
    if (column instanceof NumberColumn || typeof column === 'number')
      return new AggregateFunction(AggregateFunctionEnum.SUM, new Expression(column))
    else
      return new AggregateFunction(AggregateFunctionEnum.SUM, column)
  },

  avg: (column: Expression|NumberLike): AggregateFunction => {
    if (column instanceof NumberColumn || typeof column === 'number')
      return new AggregateFunction(AggregateFunctionEnum.AVG, new Expression(column))
    else
      return new AggregateFunction(AggregateFunctionEnum.AVG, column)
  },

  count: (column: Expression|NumberLike): AggregateFunction => {
    if (column instanceof NumberColumn || typeof column === 'number')
      return new AggregateFunction(AggregateFunctionEnum.COUNT, new Expression(column))
    else
      return new AggregateFunction(AggregateFunctionEnum.COUNT, column)
  },

  max: (column: Expression|NumberLike): AggregateFunction => {
    if (column instanceof NumberColumn || typeof column === 'number')
      return new AggregateFunction(AggregateFunctionEnum.MAX, new Expression(column))
    else
      return new AggregateFunction(AggregateFunctionEnum.MAX, column)
  },

  min: (column: Expression|NumberLike): AggregateFunction => {
    if (column instanceof NumberColumn || typeof column === 'number')
      return new AggregateFunction(AggregateFunctionEnum.MIN, new Expression(column))
    else
      return new AggregateFunction(AggregateFunctionEnum.MIN, column)
  },
}
