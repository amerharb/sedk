import { PrimitiveType } from '../steps/Step'
import { BooleanColumn, NumberColumn, TextColumn } from '../columns'
import { AggregateFunction } from '../aggregateFunction'
import { Expression } from './Expression'

//TODO: include other value type like date-time
export type BooleanLike = boolean|BooleanColumn
export type NumberLike = number|NumberColumn
export type TextLike = string|TextColumn
export type ValueType = null|BooleanLike|NumberLike|TextLike
export type OperandType = ValueType|AggregateFunction|Expression

const booleanArray: readonly string[] = ['t', 'tr', 'tru', 'true', 'f', 'fa', 'fal', 'fals', 'false']
type TextBooleanSmallLetter = typeof booleanArray[number]
export type TextBoolean = TextBooleanSmallLetter|Capitalize<TextBooleanSmallLetter>|Uppercase<TextBooleanSmallLetter>

export function isTextBoolean(text: unknown): text is TextBoolean {
  if (typeof text === 'string')
    return booleanArray.includes(text)
  return false
}

export function isTextNumber(text: unknown): text is number {
  if (typeof text === 'string') {
    const numberRegex = /^-?[0-9]+(\.[0-9]+)?$/
    return numberRegex.test(text)
  }
  return false
}

/**
 * @deprecated
 */
export type PostgresBinder = {
  sql: string,
  values: PrimitiveType[]
}
