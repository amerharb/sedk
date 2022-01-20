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
