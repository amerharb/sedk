import { Binder, BinderArray } from '../binder'
import { Expression, ExpressionType } from './Expression'
import { BuilderData } from '../builder'
import { AggregateFunction } from '../AggregateFunction'
import { BooleanColumn, Column, DateColumn, NumberColumn, TextColumn } from '../database'
import { OperandType, isNumber } from './types'
import { IStatementGiver } from './IStatementGiver'
import { getStmtBoolean, getStmtDate, getStmtNull, getStmtString } from '../util'
import { Condition } from './Condition'

export class Operand implements IStatementGiver {
	public type: ExpressionType

	constructor(
		public readonly value: OperandType|Binder|OperandType[]|BinderArray,
		public readonly isNot: boolean = false,
	) {
		this.value = value
		this.type = Operand.getExpressionType(value)
		Operand.throwIfInvalidUseOfNot(this.type, isNot)
	}

	public getStmt(data: BuilderData): string {
		return Operand.getStmtOfValue(this.value, this.isNot, data)
	}

	/**
	 * written as static in separate function to be able to call it recursively
	 * when the value is an array
	 */
	private static getStmtOfValue(
		value: OperandType|Binder|OperandType[]|BinderArray,
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
		} else if (value instanceof BinderArray) {
			value.binders.forEach(it => {
				if (it.no === undefined) {
					data.binderStore.add(it)
				}
			})
			return `${value.getStmt()}`
		} else if (typeof value === 'boolean') {
			return `${isNot ? 'NOT ' : ''}${getStmtBoolean(value)}`
		} else if (isNumber(value)) {
			return `${isNot ? 'NOT ' : ''}${value}`
		} else if (typeof value === 'string') {
			return getStmtString(value)
		} else if (value instanceof Date) {
			return `${isNot ? 'NOT ' : ''}${getStmtDate(value)}`
		} else if (value instanceof AggregateFunction) {
			return `${isNot ? 'NOT ' : ''}${value.getStmt(data)}`
		} else if (value instanceof Expression) {
			return `${isNot ? 'NOT ' : ''}${value.getStmt(data)}`
		} else if (value instanceof Condition) { /** ignore IDE warning, "value" can be an instance of Condition */
			return `${isNot ? 'NOT ' : ''}${value.getStmt(data)}`
		} else if (Array.isArray(value)) {
			return `${isNot ? 'NOT ' : ''}(${value.map(it => Operand.getStmtOfValue(it, isNot, data)).join(', ')})`
		} else if (value instanceof Column) {
			return `${isNot ? 'NOT ' : ''}${value.getStmt(data)}`
		}
		throw new Error(`Operand type of value: ${value} is not supported`)
	}

	private static getExpressionType(operand: OperandType|Binder|OperandType[]|BinderArray): ExpressionType {
		if (operand === null) {
			return ExpressionType.NULL
		} else if (typeof operand === 'boolean' || operand instanceof BooleanColumn) {
			return ExpressionType.BOOLEAN
		} else if (isNumber(operand) || operand instanceof NumberColumn) {
			return ExpressionType.NUMBER
		} else if (typeof operand === 'string' || operand instanceof TextColumn) {
			return ExpressionType.TEXT
		} else if (operand instanceof Date || operand instanceof DateColumn) {
			return ExpressionType.DATE
		} else if (operand instanceof AggregateFunction) {
			return ExpressionType.NUMBER
			/** ignore IDE warning, operand can be an instance of Condition */
		} else if (operand instanceof Expression || operand instanceof Binder || operand instanceof BinderArray || operand instanceof Condition) {
			return operand.type
		} else if (Array.isArray(operand)) {
			return ExpressionType.ARRAY
		}
		throw new Error(`Operand type of: ${operand} is not supported`)
	}

	private static throwIfInvalidUseOfNot(expressionType: ExpressionType, notValue: boolean|undefined): void {
		if (notValue === true && expressionType !== ExpressionType.BOOLEAN) {
			throw new Error('You can not use "NOT" modifier unless expression type is boolean')
		}
	}
}
