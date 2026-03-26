import { Artifacts } from '../steps/BaseStep.ts'
import {
	ComparisonOperator,
	NullOperator,
	Operator,
	isArithmeticOperator,
	isBitwiseOperator,
	isComparisonOperator,
	isNullOperator,
	isTextOperator,
} from '../operators.ts'
import { Binder, BinderArray, BinderStore } from '../binder.ts'
import { BuilderData } from '../builder.ts'
import { SelectItemInfo } from '../SelectItemInfo.ts'
import { Column } from '../database/index.ts'
import { InvalidExpressionError } from '../errors.ts'
import { Operand } from './Operand.ts'
import {
	NonNullPrimitiveType,
	OperandType,
	PrimitiveType,
	ValueLike,
	isTextBoolean,
	isTextNumber,
} from './types.ts'
import { IStatementGiver } from './IStatementGiver.ts'
import { Condition } from './Condition.ts'
import { ItemInfo } from '../ItemInfo.ts'

export enum ExpressionType {
	NOT_EXIST,
	NULL,
	BOOLEAN,
	NUMBER,
	TEXT,
	DATE,
	// TODO: make this type more specific like array of number, array of text, etc.
	ARRAY
}

type ExpressionConstruction = {
	left: OperandType|Binder|OperandType[]|BinderArray
	operator?: Operator
	right?: OperandType
	notLeft: boolean
	notRight: boolean
}

export class Expression implements IStatementGiver {
	public readonly leftOperand: Operand
	public readonly operator?: Operator
	public readonly rightOperand?: Operand
	public readonly type: ExpressionType

	constructor(con: ExpressionConstruction) {
		this.leftOperand = new Operand(con.left, con.notLeft)
		this.operator = con.operator
		this.rightOperand = con.right !== undefined
			? new Operand(con.right, con.notRight)
			: undefined

		if (this.rightOperand === undefined || this.rightOperand.type === ExpressionType.NOT_EXIST) {
			this.type = this.leftOperand.type
		} else if (con.operator !== undefined) {
			this.type = Expression.getResultExpressionType(this.leftOperand, con.operator, this.rightOperand)
		} else {
			throw new Error('Error while calculate Expression Type, failed to create object Expression')
		}
	}

	public getStmt(data: BuilderData, artifacts: Artifacts, binderStore: BinderStore): string {
		if (this.operator !== undefined && this.rightOperand !== undefined) {
			return `(${this.leftOperand.getStmt(data, artifacts, binderStore)} ${this.operator.toString()} ${this.rightOperand.getStmt(data, artifacts, binderStore)})`
		}
		return this.leftOperand.getStmt(data, artifacts, binderStore)
	}

	public as(alias: string): ItemInfo {
		return new SelectItemInfo(this, alias)
	}

	public eq(value: ValueLike): Condition {
		return new Condition({
			leftExpression: this,
			operator: ComparisonOperator.Equal,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public eq$(value: NonNullPrimitiveType): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: this,
			operator: ComparisonOperator.Equal,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public ne(value: ValueLike): Condition {
		return new Condition({
			leftExpression: this,
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public ne$(value: NonNullPrimitiveType): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: this,
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public isEq(value: PrimitiveType): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition({
			leftExpression: this,
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public isEq$(value: PrimitiveType): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition({
			leftExpression: this,
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public isNe(value: PrimitiveType): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition({
			leftExpression: this,
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public isNe$(value: PrimitiveType): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition({
			leftExpression: this,
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public getColumns(): Column[] {
		const columns: Column[] = []

		const left = this.leftOperand.value
		if (left instanceof Column)
			columns.push(left)
		else if (left instanceof Expression)
			columns.push(...left.getColumns())

		const right = this.rightOperand?.value
		if (right instanceof Column)
			columns.push(right)
		else if (right instanceof Expression)
			columns.push(...right.getColumns())

		return columns
	}

	public static getSimpleExp(left: OperandType|Binder|OperandType[]|BinderArray, notLeft: boolean = false): Expression {
		return new Expression({ left, notLeft, notRight: false })
	}

	public static getComplexExp(
		left: OperandType|Binder|OperandType[]|BinderArray,
		operator: Operator,
		right: OperandType,
	): Expression {
		return new Expression({ left, operator, right, notLeft: false, notRight: false })
	}

	private static getResultExpressionType(left: Operand, operator: Operator, right: Operand): ExpressionType {
		if (isArithmeticOperator(operator)) {
			if ((left.type === ExpressionType.NULL && right.type === ExpressionType.NUMBER)
				|| (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NULL))
				return ExpressionType.NULL

			if (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NUMBER)
				return ExpressionType.NUMBER

			if (((left.type === ExpressionType.TEXT && isTextNumber(left.value)) && right.type === ExpressionType.NUMBER)
				|| (left.type === ExpressionType.NUMBER && (right.type === ExpressionType.TEXT && isTextNumber(right.value))))
				return ExpressionType.NUMBER

			Expression.throwInvalidTypeError(left.type, operator, right.type)
		}

		if (isBitwiseOperator(operator)) {
			if (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NUMBER)
				return ExpressionType.NUMBER

			if (left.type === ExpressionType.NUMBER && (right.type === ExpressionType.TEXT && isTextNumber(right.value))
				|| right.type === ExpressionType.NUMBER && (left.type === ExpressionType.TEXT && isTextNumber(left.value)))
				return ExpressionType.NUMBER

			Expression.throwInvalidTypeError(left.type, operator, right.type)
		}

		if (isComparisonOperator(operator)) {
			if (Expression.isListComparisonOperator(operator)) {
				// TODO: check the values of the right same type of the left
				if (right.type === ExpressionType.ARRAY)
					return ExpressionType.BOOLEAN

				Expression.throwInvalidTypeError(left.type, operator, right.type)
			} else {
				if (left.type === ExpressionType.NULL || right.type === ExpressionType.NULL)
					return ExpressionType.NULL

				if (left.type === right.type)
					return ExpressionType.BOOLEAN

				if (left.type === ExpressionType.BOOLEAN && (right.type === ExpressionType.TEXT && isTextBoolean(right.value))
					|| right.type === ExpressionType.BOOLEAN && (left.type === ExpressionType.TEXT && isTextBoolean(left.value)))
					return ExpressionType.BOOLEAN

				if (left.type === ExpressionType.NUMBER && (right.type === ExpressionType.TEXT && isTextNumber(right.value))
					|| right.type === ExpressionType.NUMBER && (left.type === ExpressionType.TEXT && isTextNumber(left.value)))
					return ExpressionType.BOOLEAN
			}
			Expression.throwInvalidTypeError(left.type, operator, right.type)
		}

		if (isNullOperator(operator)) {
			if (right.type === ExpressionType.NULL)
				return ExpressionType.BOOLEAN

			if (right.type === ExpressionType.BOOLEAN) {
				if (left.type === ExpressionType.NULL || ExpressionType.BOOLEAN)
					return ExpressionType.BOOLEAN
				if (left.type === ExpressionType.TEXT && isTextBoolean(left.value))
					return ExpressionType.BOOLEAN
			}

			Expression.throwInvalidTypeError(left.type, operator, right.type)
		}

		if (isTextOperator(operator)) {
			if (left.type === ExpressionType.NULL || right.type === ExpressionType.NULL)
				return ExpressionType.NULL

			if (left.type === ExpressionType.TEXT
				&& (right.type === ExpressionType.TEXT || right.type === ExpressionType.NUMBER))
				return ExpressionType.TEXT

			if (left.type === ExpressionType.NUMBER && right.type === ExpressionType.TEXT)
				return ExpressionType.TEXT

			Expression.throwInvalidTypeError(left.type, operator, right.type)
		}

		throw new Error(`Function "getResultExpressionType" does not support operator: "${operator}"`)
	}

	private static throwInvalidTypeError(leftType: ExpressionType, operator: Operator, rightType: ExpressionType): never {
		throw new InvalidExpressionError(`You can not have "${ExpressionType[leftType]}" and "${ExpressionType[rightType]}" with operator "${operator}"`)
	}

	private static isListComparisonOperator(operator: Operator): boolean {
		return [ComparisonOperator.In, ComparisonOperator.NotIn].includes(operator as ComparisonOperator)
	}
}
