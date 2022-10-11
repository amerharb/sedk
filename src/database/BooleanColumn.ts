import { Binder, BinderArray } from '../binder'
import { Column, ColumnObj } from './Column'
import { Condition, UpdateCondition } from '../models/Condition'
import { Expression, ExpressionType } from '../models/Expression'
import { Operand } from '../models/Operand'
import { BooleanLike } from '../models/types'
import { ComparisonOperator, NullOperator } from '../operators'
import { Default } from '../singletoneConstants'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'

export class BooleanColumn extends Column implements Condition {
	// START implement Condition
	public readonly leftExpression: Expression = new Expression(this)
	public readonly leftOperand: Operand = this.leftExpression.leftOperand
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
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value))
	}

	public ne$(value: boolean): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(binder))
	}

	// END implement Condition

	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|BooleanLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public isEq$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public isNe(value: null|BooleanLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public isNe$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public get not(): Condition {
		return new Condition(new Expression(this, true))
	}

	public in(...values: BooleanLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		return new Condition(new Expression(this), ComparisonOperator.In, new Expression(values))
	}

	public in$(...values: boolean[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.In)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition(new Expression(this), ComparisonOperator.In, new Expression(binderArray))
	}

	public notIn(...values: BooleanLike[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		return new Condition(new Expression(this), ComparisonOperator.NotIn, new Expression(values))
	}

	public notIn$(...values: boolean[]): Condition {
		Column.throwIfArrayIsEmpty(values, ComparisonOperator.NotIn)
		const binderArray = new BinderArray(values.map(it => new Binder(it)))
		return new Condition(new Expression(this), ComparisonOperator.NotIn, new Expression(binderArray))
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
