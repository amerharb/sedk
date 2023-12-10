import { Artifacts } from '../steps/BaseStep.ts'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo.ts'
import { Binder, BinderStore } from '../binder.ts'
import { BuilderData } from '../builder.ts'
import { BooleanColumn, Column, DateColumn, NumberColumn, TextColumn } from '../database/index.ts'
import { InvalidConditionError } from '../errors.ts'
import { ItemInfo } from '../ItemInfo.ts'
import {
	ComparisonOperator,
	NullOperator,
	Operator,
	Qualifier,
	isComparisonOperator,
	isNullOperator,
} from '../operators.ts'
import { SelectItemInfo } from '../SelectItemInfo.ts'
import { Expression, ExpressionType } from './Expression.ts'
import { IStatementGiver } from './IStatementGiver.ts'
import { ConditionOperand, Operand } from './Operand.ts'
import { BooleanLike, isTextBoolean } from './types.ts'

type ConditionConstructor = {
	leftExpression: Expression,
	operator?: Qualifier,
	rightExpression?: Expression,
	notLeft?: boolean,
	notRight?: boolean,
}

export class Condition implements Expression, IStatementGiver {
	public readonly operator?: Qualifier

	// Implement Expression
	public readonly leftOperand: ConditionOperand
	public readonly rightOperand?: ConditionOperand
	public readonly type: ExpressionType.NULL|ExpressionType.BOOLEAN

	constructor(con: ConditionConstructor) {
		this.leftOperand = new ConditionOperand(con.leftExpression, con.notLeft)
		this.operator = con.operator
		this.rightOperand = con.rightExpression !== undefined ? new ConditionOperand(con.rightExpression, con.notRight) : undefined
		this.type = Condition.getResultExpressionType(con.leftExpression, con.operator, con.rightExpression)
	}

	public getStmt(data: BuilderData, artifacts: Artifacts, binderStore: BinderStore): string {
		if (this.operator !== undefined && this.rightOperand !== undefined)
			if (this.leftOperand.value instanceof Condition) {
				return `(${this.leftOperand.getStmt(data, artifacts, binderStore)}) ${this.operator} ${this.rightOperand.getStmt(data, artifacts, binderStore)}`
			} else {
				return `${this.leftOperand.getStmt(data, artifacts, binderStore)} ${this.operator} ${this.rightOperand.getStmt(data, artifacts, binderStore)}`
			}
		else
			return this.leftOperand.getStmt(data, artifacts, binderStore)
	}

	// Implement Expression, We don't really need it
	public as(alias: string): ItemInfo {
		return new SelectItemInfo(this, alias)
	}

	public eq(value: BooleanLike): Condition {
		return new Condition({
			leftExpression: this,
			operator: ComparisonOperator.Equal,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public eq$(value: boolean): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: this,
			operator: ComparisonOperator.Equal,
			rightExpression: Expression.getSimpleExp(binder),
		})

	}

	public ne(value: BooleanLike): Condition {
		return new Condition({
			leftExpression: this,
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(value),
		})

	}

	public ne$(value: boolean): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: this,
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(binder),
		})

	}

	public isEq(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition({
			leftExpression: this,
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})

	}

	public isEq$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition({
			leftExpression: this,
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})

	}

	public isNe(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition({
			leftExpression: this,
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})

	}

	public isNe$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition({
			leftExpression: this,
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})

	}

	public get NOT(): Condition {
		return new Condition({ leftExpression: this, notLeft: true })
	}

	// Implement Expression, but still good to keep it
	public getColumns(): Column[] {
		const columns: Column[] = []
		columns.push(...this.leftOperand.value.getColumns())
		if (this.rightOperand?.value !== undefined)
			columns.push(...this.rightOperand.value.getColumns())

		return columns
	}

	private static getResultExpressionType(leftExpression: Expression, operator?: Qualifier, rightExpression?: Expression)
		: ExpressionType.NULL|ExpressionType.BOOLEAN {
		if (operator === undefined || rightExpression === undefined) {
			if (leftExpression.type === ExpressionType.NULL || leftExpression.type === ExpressionType.BOOLEAN) {
				return leftExpression.type
			}
			Condition.throwInvalidConditionError(leftExpression.type)
		}

		if (leftExpression.type === rightExpression.type) {
			return ExpressionType.BOOLEAN
		}

		if (isNullOperator(operator)) {
			if (rightExpression.type === ExpressionType.NULL) {
				return ExpressionType.BOOLEAN
			} else if (leftExpression.type === ExpressionType.NULL && rightExpression.type === ExpressionType.BOOLEAN) {
				return ExpressionType.BOOLEAN
			} else if (leftExpression.type === ExpressionType.BOOLEAN || rightExpression.type === ExpressionType.BOOLEAN) {
				Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
			} else if (leftExpression.type === ExpressionType.NULL) {
				Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
			}
			Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
		} else if (isComparisonOperator(operator)) {
			if (Condition.isListComparisonOperator(operator)) {
				// TODO: Check if leftExpression list values are comparable with rightExpression
				if (rightExpression.type === ExpressionType.ARRAY) {
					return ExpressionType.BOOLEAN
				}
				Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
			} else {
				if (leftExpression.type === ExpressionType.NULL || rightExpression.type === ExpressionType.NULL) {
					return ExpressionType.NULL
				} else if (leftExpression.type === ExpressionType.BOOLEAN && rightExpression.type === ExpressionType.TEXT && isTextBoolean(rightExpression.leftOperand.value)) {
					return ExpressionType.BOOLEAN
				}
			}
			Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
		}
		Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
	}

	private static isListComparisonOperator(operator: Operator): boolean {
		return [ComparisonOperator.In, ComparisonOperator.NotIn].includes(operator as ComparisonOperator)
	}

	private static throwInvalidConditionError(leftType: ExpressionType, operator?: Operator, rightType?: ExpressionType): never {
		if (operator === undefined || rightType === undefined) {
			throw new InvalidConditionError(`Condition can not created with only "${ExpressionType[leftType]}"`)
		}
		throw new InvalidConditionError(`Condition can not created with "${ExpressionType[leftType]}" "${operator}" "${ExpressionType[rightType]}"`)
	}
}

export class UpdateCondition extends Condition implements UpdateSetItemInfo {
	public readonly operand: Operand
	public readonly column: Column

	public constructor(column: BooleanColumn|NumberColumn|TextColumn|DateColumn, rightExpression: Expression) {
		super({
			leftExpression: Expression.getSimpleExp(column),
			operator: ComparisonOperator.Equal,
			rightExpression,
		})
		this.operand = new Operand(rightExpression)
		this.column = column
	}
}
