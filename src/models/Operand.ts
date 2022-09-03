import { Binder } from '../binder'
import { Expression, ExpressionType } from './Expression'
import { BuilderData } from '../builder'
import { AggregateFunction } from '../AggregateFunction'
import { BooleanColumn, Column, DateColumn, NumberColumn, TextColumn } from '../database'
import { OperandType } from './types'
import { IStatementGiver } from './IStatementGiver'
import { getStmtBoolean, getStmtDate, getStmtNull, getStmtString } from '../util'
import { Condition } from './Condition'

export class Operand implements IStatementGiver {
	// TODO: check why value can be undefined
	public value?: OperandType|Binder|OperandType[]
	public type: ExpressionType
	public isNot: boolean

	constructor(value?: OperandType|Binder|OperandType[], isNot?: boolean) {
		this.value = value
		this.type = Operand.getExpressionType(value)
		this.isNot = Operand.getNotValueOrThrow(isNot, this.type)
	}

	public getStmt(data: BuilderData): string {
		return Operand.getStmtOfValue(this.value, this.isNot, data)
	}

	private static getStmtOfValue(
		value: OperandType|Binder|OperandType[]|undefined,
		isNot: boolean,
		data: BuilderData,
	): string {
		if (value === null) {
			return getStmtNull()
		} else if (value instanceof Binder) {
			if (value.no === undefined) {
				data.binderStore.add(value)
			}
			return `${value.getStmt()}`
		} else if (typeof value === 'string') {
			return getStmtString(value)
		} else if (typeof value === 'boolean') {
			return `${isNot ? 'NOT ' : ''}${getStmtBoolean(value)}`
		} else if (value instanceof AggregateFunction) {
			return `${isNot ? 'NOT ' : ''}${value.getStmt(data)}`
		} else if (value instanceof Expression) {
			return `${isNot ? 'NOT ' : ''}${value.getStmt(data)}`
		} else if (value instanceof Condition) { /** ignore IDE warning, "value" can be an instance of Condition */
			return `${isNot ? 'NOT ' : ''}${value.getStmt(data)}`
		} else if (value instanceof Column) {
			return `${isNot ? 'NOT ' : ''}${value.getStmt(data)}`
		} else if (typeof value === 'number') {
			return `${isNot ? 'NOT ' : ''}${value}`
		} else if (value instanceof Date) {
			return `${isNot ? 'NOT ' : ''}${getStmtDate(value)}`
		} else if (typeof value === 'undefined') {
			return `${isNot ? 'NOT' : ''}`
		} else if (Array.isArray(value)) {
			return `${isNot ? 'NOT ' : ''}(${value.map(it => this.getStmtOfValue(it, isNot, data)).join(', ')})`
		}
		throw new Error('Operand type is not supported')
	}

	private static getExpressionType(operand?: OperandType|Binder|OperandType[]): ExpressionType {
		if (operand === undefined) {
			return ExpressionType.NOT_EXIST
		} else if (operand === null) {
			return ExpressionType.NULL
		} else if (typeof operand === 'boolean' || operand instanceof BooleanColumn) {
			return ExpressionType.BOOLEAN
		} else if (typeof operand === 'number' || operand instanceof NumberColumn) {
			return ExpressionType.NUMBER
		} else if (typeof operand === 'string' || operand instanceof TextColumn) {
			return ExpressionType.TEXT
		} else if (operand instanceof Date || operand instanceof DateColumn) {
			return ExpressionType.DATE
		} else if (operand instanceof AggregateFunction) {
			return ExpressionType.NUMBER
		} else if (operand instanceof Expression) {
			return operand.type
		} else if (operand instanceof Condition) { /** ignore IDE warning, operand can be an instance of Condition */
			return operand.type
		} else if (operand instanceof Binder) {
			if (operand.value === null) {
				return ExpressionType.NULL
			} else if (typeof operand.value === 'boolean') {
				return ExpressionType.BOOLEAN
			} else if (typeof operand.value === 'number') {
				return ExpressionType.NUMBER
			} else if (typeof operand.value === 'string') {
				return ExpressionType.TEXT
			} else if (operand.value instanceof Date) {
				return ExpressionType.DATE
			} else if (Array.isArray(operand.value)) {
				return ExpressionType.ARRAY
			}
		} else if (Array.isArray(operand)) {
			return ExpressionType.ARRAY
		}
		throw new Error('Operand type is not supported')
	}

	private static getNotValueOrThrow(notValue: boolean|undefined, expressionType: ExpressionType): boolean {
		if (notValue === true) {
			if (expressionType === ExpressionType.BOOLEAN) {
				return true
			} else {
				throw new Error('You can not use "NOT" modifier unless expression type is boolean')
			}
		} else {
			return false
		}
	}
}
