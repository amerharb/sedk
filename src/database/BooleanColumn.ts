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
	public readonly leftOperand: ConditionOperand = new ConditionOperand(new Expression(this))
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
		return new UpdateCondition(this, new Expression(value))
	}

	public eq$(value: null): UpdateSetItemInfo
	public eq$(value: boolean): UpdateCondition
	public eq$(value: boolean|null): UpdateCondition|UpdateSetItemInfo {
		const binder = new Binder(value)
		if (value === null) {
			return new UpdateSetItemInfo(this, new Expression(binder))
		}
		return new UpdateCondition(this, new Expression(binder))
	}

	public ne(value: BooleanLike): Condition {
		return new Condition({
			leftExpression: new Expression(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: new Expression(value),
		})
	}

	public ne$(value: boolean): Condition {
		const binder = new Binder(value)
		return new Condition({
			leftExpression: new Expression(this),
			operator: ComparisonOperator.NotEqual,
			rightExpression: new Expression(binder),
		})
	}

	// END implement Condition

	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|BooleanLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition({
			leftExpression: new Expression(this),
			operator: qualifier,
			rightExpression: new Expression(value),
		})
	}

	public isEq$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition({
			leftExpression: new Expression(this),
			operator: qualifier,
			rightExpression: new Expression(binder),
		})
	}

	public isNe(value: null|BooleanLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition({
			leftExpression: new Expression(this),
			operator: qualifier,
			rightExpression: new Expression(value),
		})
	}

	public isNe$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition({
			leftExpression: new Expression(this),
			operator: qualifier,
			rightExpression: new Expression(binder),
		})
	}

	/** @deprecated - since v0.15.0 use NOT */
	public get not(): Condition {
		return this.NOT
	}

	public get NOT(): Condition {
		return new Condition({ leftExpression: new Expression(this, true) })
	}

	public in(...values: BooleanLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		return new Condition({
			leftExpression: new Expression(this),
			operator: ComparisonOperator.In,
			rightExpression: new Expression(values),
		})
	}

	public in$(...values: boolean[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: new Expression(this),
			operator: ComparisonOperator.In,
			rightExpression: new Expression(binderArray),
		})
	}

	public notIn(...values: BooleanLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		return new Condition({
			leftExpression: new Expression(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: new Expression(values),
		})
	}

	public notIn$(...values: boolean[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition({
			leftExpression: new Expression(this),
			operator: ComparisonOperator.NotIn,
			rightExpression: new Expression(binderArray),
		})
	}

	/** @deprecated - since v0.15.0 use eq() */
	public let(value: boolean|null|Default): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, value)
	}

	/** @deprecated - since v0.15.0 use eq$() */
	public let$(value: boolean|null): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, new Binder(value))
	}
}
