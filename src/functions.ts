import { Expression, OperandType, Operator } from './models'

export function e(left: OperandType): Expression
export function e(left: OperandType, operator: Operator, right: OperandType): Expression
export function e(left: OperandType, operator?: Operator, right?: OperandType): Expression {
  if (operator !== undefined && right !== undefined)
    return new Expression(left, operator, right)
  else
    return new Expression(left)
}
