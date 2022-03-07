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

export function e(left: OperandType): Expression
export function e(left: BooleanLike, operator: ComparisonOperator, right: BooleanLike|TextBoolean): Condition
export function e(left: NumberLike, operator: ComparisonOperator, right: NumberLike): Condition
export function e(left: TextLike, operator: ComparisonOperator, right: TextLike): Condition
export function e(left: OperandType, operator: Operator, right: OperandType|TextBoolean): Expression
export function e(left: OperandType, operator?: Operator, right?: OperandType): Expression {
  if (operator !== undefined && right !== undefined)
    return new Expression(left, operator, right)
  else
    return new Expression(left)
}

export function o(alias: OrderByItem, direction?: OrderByDirection, nullsPosition?: OrderByNullsPosition): OrderByItemInfo {
  return new OrderByItemInfo(alias, direction, nullsPosition)
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
