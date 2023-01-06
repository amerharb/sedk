import { Artifacts } from './steps/BaseStep'
import {
	Condition,
	Expression,
	ExpressionType,
	IStatementGiver,
} from './models'
import { SelectItemInfo } from './SelectItemInfo'
import { BuilderData } from './builder'
import { ComparisonOperator } from './operators'
import { Binder, BinderStore } from './binder'
import { Column } from './database'
import { ItemInfo } from './ItemInfo'

export enum AggregateFunctionEnum {
	SUM = 'SUM',
	AVG = 'AVG',
	COUNT = 'COUNT',
	MAX = 'MAX',
	MIN = 'MIN',
}

export class AggregateFunction implements IStatementGiver {
	private readonly unique: symbol = Symbol()

	constructor(public readonly funcName: AggregateFunctionEnum, private readonly expression: Expression) {
		if (expression.type !== ExpressionType.NUMBER)
			throw new Error('Expression Type must be number in aggregate function')
	}

	public as(alias: string): ItemInfo {
		return new SelectItemInfo(this, alias)
	}

	public eq(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.Equal,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public eq$(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.Equal,
			rightExpression: Expression.getSimpleExp(new Binder(value)),
		})
	}

	public ne(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public ne$(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(new Binder(value)),
		})
	}

	public gt(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterThan,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public gt$(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterThan,
			rightExpression: Expression.getSimpleExp(new Binder(value)),
		})
	}

	public ge(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterOrEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public ge$(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.GreaterOrEqual,
			rightExpression: Expression.getSimpleExp(new Binder(value)),
		})
	}

	public lt(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserThan,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public lt$(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserThan,
			rightExpression: Expression.getSimpleExp(new Binder(value)),
		})
	}

	public le(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserOrEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public le$(value: number): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.LesserOrEqual,
			rightExpression: Expression.getSimpleExp(new Binder(value)),
		})
	}

	public getStmt(data: BuilderData, artifacts: Artifacts, binderStore: BinderStore): string {
		if (this.expression.rightOperand === undefined || this.expression.rightOperand.type === ExpressionType.NOT_EXIST)
			return `${this.funcName}(${this.expression.getStmt(data, artifacts, binderStore)})`
		return `${this.funcName}${this.expression.getStmt(data, artifacts, binderStore)}`
	}

	public getColumns(): Column[] {
		return this.expression.getColumns()
	}
}
