import { Binder, BinderArray } from '../binder'
import { Column, ColumnObj } from './Column'
import {
	BooleanLike,
	Condition,
	ConditionOperand,
	Expression,
	ExpressionType,
	UpdateCondition,
} from '../models'
import { ComparisonOperator, NullOperator } from '../operators'
import { Default } from '../singletoneConstants'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'

export class BooleanColumn extends Column implements Condition {
	// START implement Condition
	public readonly leftOperand: ConditionOperand = new ConditionOperand(Expression.getSimpleExp(this))
	public readonly type: ExpressionType.BOOLEAN|ExpressionType.NULL = ExpressionType.BOOLEAN

	public getColumns(): BooleanColumn[] {
		return [this]
	}

	public eq(value: null|Default): UpdateSetItemInfo
	public eq(value: BooleanLike): UpdateCondition
	public eq(value: BooleanLike|null|Default): UpdateCondition|UpdateSetItemInfo {
		if (value === null || value instanceof Default) {
			return new UpdateSetItemInfo(this, value)
		}
		return new UpdateCondition(this, Expression.getSimpleExp(value))
	}

	public eq$(value: null): UpdateSetItemInfo
	public eq$(value: boolean): UpdateCondition
	public eq$(value: boolean|null): UpdateCondition|UpdateSetItemInfo {
		const binder = new Binder(value)
		if (value === null) {
			return new UpdateSetItemInfo(this, Expression.getSimpleExp(binder))
		}
		return new UpdateCondition(this, Expression.getSimpleExp(binder))
	}

	public ne(value: BooleanLike): Condition {
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public ne$(value: boolean): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	// END implement Condition

	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|BooleanLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public isEq$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public isNe(value: null|BooleanLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(value),
		})
	}

	public isNe$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: qualifier,
			rightExpression: Expression.getSimpleExp(binder),
		})
	}

	public get NOT(): Condition {
		return new Condition({ leftExpression: Expression.getSimpleExp(this, true) })
	}

	public in(...values: BooleanLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.In,
			rightExpression: Expression.getSimpleExp(values),
		})
	}

	public in$(...values: boolean[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.In,
			rightExpression: Expression.getSimpleExp(binderArray),
		})
	}

	public notIn(...values: BooleanLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: Expression.getSimpleExp(values),
		})
	}

	public notIn$(...values: boolean[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: Expression.getSimpleExp(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: Expression.getSimpleExp(binderArray),
		})
	}
}
