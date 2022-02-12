import {
  BooleanLike,
  Condition,
  Expression, NumberLike,
  OperandType,
  TextBoolean, TextLike,
} from './models'
import {
  ComparisonOperator,
  Operator,
} from './operators'
import { OrderByDirection, OrderByItemInfo, OrderByNullsPosition } from './orderBy'
import { OrderByItem } from './steps'

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
