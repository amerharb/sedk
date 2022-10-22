import {
	ArithmeticOperator,
	BitwiseOperator,
	ComparisonOperator,
	NullOperator,
	Operator,
	TextOperator,
} from '../operators'
import { BooleanColumn, DateColumn, NumberColumn, TextColumn } from '../database'
import { AggregateFunction } from '../AggregateFunction'
import { Expression } from './Expression'

export type NonNullPrimitiveType = boolean|number|string|Date
export type PrimitiveType = null|NonNullPrimitiveType

const booleanArray: readonly string[] = ['t', 'tr', 'tru', 'true', 'f', 'fa', 'fal', 'fals', 'false']
type TextBooleanSmallLetter = typeof booleanArray[number]
export type TextBoolean = TextBooleanSmallLetter|Capitalize<TextBooleanSmallLetter>|Uppercase<TextBooleanSmallLetter>

export type BooleanLike = boolean|TextBoolean|BooleanColumn
export type NumberLike = number|NumberColumn
export type TextLike = string|TextColumn
export type DateLike = Date|DateColumn
export type ValueLike = BooleanLike|NumberLike|TextLike|DateLike
export type ValueType = null|ValueLike
export type ValueArrayType = ValueType[]
export type OperandType = ValueType|AggregateFunction|Expression|ValueArrayType

export function isTextBoolean(text: unknown): text is TextBoolean {
	if (typeof text === 'string')
		return booleanArray.includes(text.toLowerCase())
	return false
}

export function isTextNumber(text: unknown): text is number {
	if (typeof text === 'string') {
		const numberRegex = /^-?[0-9]+(\.[0-9]+)?$/
		return numberRegex.test(text)
	}
	return false
}

export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && isFinite(value)
}

export function isComparisonOperator(operator: Operator): operator is ComparisonOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(ComparisonOperator).includes(operator)
}

export function isArithmeticOperator(operator: Operator): operator is ArithmeticOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(ArithmeticOperator).includes(operator)
}

export function isBitwiseOperator(operator: Operator): operator is BitwiseOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(BitwiseOperator).includes(operator)
}

export function isTextOperator(operator: Operator): operator is TextOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(TextOperator).includes(operator)
}

export function isNullOperator(operator: Operator): operator is NullOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(NullOperator).includes(operator)
}
