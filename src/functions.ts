import { BooleanOperator, Condition, Expression, OperandType, Operator, TextBoolean } from './models'

//TODO: narrow the overload to the valid Expression only
export function e(left: OperandType): Expression
export function e(left: OperandType, operator: BooleanOperator, right: OperandType|TextBoolean): Condition
export function e(left: OperandType, operator: Operator, right: OperandType|TextBoolean): Expression
export function e(left: OperandType, operator?: Operator, right?: OperandType): Expression {
  if (operator !== undefined && right !== undefined)
    return new Expression(left, operator, right)
  else
    return new Expression(left)
}
