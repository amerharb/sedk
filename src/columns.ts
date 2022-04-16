import { Table } from './database'
import { escapeDoubleQuote } from './util'
import { Binder } from './binder'
import { BooleanLike, NumberLike, TextLike } from './models/types'
import { Operand } from './models/Operand'
import { Condition } from './models/Condition'
import { Expression, ExpressionType } from './models/Expression'
import {
  NullOperator,
  ComparisonOperator,
  TextOperator,
  Operator,
} from './operators'
import {
  OrderByItemInfo,
  DIRECTION_NOT_EXIST,
  ASC,
  DESC,
  NULLS_POSITION_NOT_EXIST,
  NULLS_FIRST,
  NULLS_LAST,
} from './orderBy'
import { SelectItemInfo } from './SelectItemInfo'
import { AggregateFunction, AggregateFunctionEnum } from './aggregateFunction'
import { IStatementGiver } from './models/IStatementGiver'
import { BuilderData } from './builder'

type ColumnObj = {
  name: string
}

export abstract class Column<A = never, B = never> implements IStatementGiver {
  private mTable?: Table

  protected constructor(protected readonly data: ColumnObj) {}

  public set table(table: Table) {
    if (this.mTable === undefined)
      this.mTable = table
    else
      throw new Error('Table can only be assigned one time')
  }

  public get table(): Table {
    if (this.mTable === undefined)
      throw new Error('Table was not assigned')

    return this.mTable
  }

  public get name(): string {
    return this.data.name
  }

  public as(alias: string): SelectItemInfo {
    return new SelectItemInfo(this, alias)
  }

  public get asc(): OrderByItemInfo {
    return new OrderByItemInfo(this, ASC, NULLS_POSITION_NOT_EXIST)
  }

  public get desc(): OrderByItemInfo {
    return new OrderByItemInfo(this, DESC, NULLS_POSITION_NOT_EXIST)
  }

  public get nullsFirst(): OrderByItemInfo {
    return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_FIRST)
  }

  public get nullsLast(): OrderByItemInfo {
    return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_LAST)
  }

  public get ascNullsFirst(): OrderByItemInfo {
    return new OrderByItemInfo(this, ASC, NULLS_FIRST)
  }

  public get descNullsFirst(): OrderByItemInfo {
    return new OrderByItemInfo(this, DESC, NULLS_FIRST)
  }

  public get ascNullsLast(): OrderByItemInfo {
    return new OrderByItemInfo(this, ASC, NULLS_LAST)
  }

  public get descNullsLast(): OrderByItemInfo {
    return new OrderByItemInfo(this, DESC, NULLS_LAST)
  }

  public abstract eq(value: A): Condition

  public abstract eq$(value: B): Condition

  public getStmt(data: BuilderData): string {
    if (this.mTable === undefined)
      throw new Error('Table of this column is undefined')

    const schemaName = data.fromItemInfos.some(it => (it.table !== this.table && it.table.name === this.table.name))
      ? `"${escapeDoubleQuote(this.table.schema.name)}".`
      : ''

    const tableName = (
      data.option.addTableName === 'always'
      || (data.option.addTableName === 'when two tables or more'
        && data.fromItemInfos.some(it => it.table !== this.table))
    ) ? `"${escapeDoubleQuote(this.table.name)}".` : ''

    return `${schemaName}${tableName}"${escapeDoubleQuote(this.data.name)}"`
  }
}

export class BooleanColumn extends Column<null|BooleanLike, null|boolean> implements Condition {
  // START implement Condition
  public readonly leftExpression: Expression = new Expression(this)
  public readonly leftOperand: Operand = this.leftExpression.leftOperand
  public readonly type: ExpressionType = ExpressionType.BOOLEAN

  public getColumns(): Column<null|BooleanLike, null|boolean>[] {
    return [this]
  }
  // END implement Condition

  constructor(data: ColumnObj) {
    super(data)
  }

  public eq(value: null|BooleanLike): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|boolean): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    const binder = new Binder(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public ne(value: null|BooleanLike): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public ne$(value: null|boolean): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    const binder = new Binder(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public not(): Condition {
    return new Condition(new Expression(this, true))
  }
}

export class NumberColumn extends Column<null|NumberLike, null|number> {
  constructor(data: ColumnObj) {
    super(data)
  }

  public eq(value: null|NumberLike): Condition
  public eq(value1: NumberLike, op: Operator, value2: NumberLike): Condition
  public eq(value1: null|NumberLike, op?: Operator, value2?: NumberLike): Condition {
    if (op === undefined && value2 === undefined) {
      const qualifier = value1 === null ? NullOperator.Is : ComparisonOperator.Equal
      return new Condition(new Expression(this), qualifier, new Expression(value1))
    } else if (op !== undefined && value2 !== undefined) {
      return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(value1, op, value2))
    }
    throw new Error('not supported case')
  }

  public eq$(value: null|number): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    const binder = new Binder(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public ne(value: null|NumberLike): Condition
  public ne(value1: NumberLike, op: Operator, value2: NumberLike): Condition
  public ne(value1: null|NumberLike, op?: Operator, value2?: NumberLike): Condition {
    if (op === undefined && value2 === undefined) {
      const qualifier = value1 === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
      return new Condition(new Expression(this), qualifier, new Expression(value1))
    } else if (op !== undefined && value2 !== undefined) {
      return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value1, op, value2))
    }
    throw new Error('not supported case')
  }

  public ne$(value: null|number): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    const binder = new Binder(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public gt(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(value))
  }

  public gt$(value: number): Condition {
    const binder = new Binder(value)
    return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(binder))
  }

  public ge(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(value))
  }

  public ge$(value: number): Condition {
    const binder = new Binder(value)
    return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(binder))
  }

  public lt(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(value))
  }

  public lt$(value: number): Condition {
    const binder = new Binder(value)
    return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(binder))
  }

  public le(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(value))
  }

  public le$(value: number): Condition {
    const binder = new Binder(value)
    return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(binder))
  }

  public get sum(): AggregateFunction {
    return new AggregateFunction(AggregateFunctionEnum.SUM, new Expression(this))
  }

  public get avg(): AggregateFunction {
    return new AggregateFunction(AggregateFunctionEnum.AVG, new Expression(this))
  }

  public get count(): AggregateFunction {
    return new AggregateFunction(AggregateFunctionEnum.COUNT, new Expression(this))
  }

  public get max(): AggregateFunction {
    return new AggregateFunction(AggregateFunctionEnum.MAX, new Expression(this))
  }

  public get min(): AggregateFunction {
    return new AggregateFunction(AggregateFunctionEnum.MIN, new Expression(this))
  }
}

export class TextColumn extends Column<null|TextLike, null|string> {
  constructor(data: ColumnObj) {
    super(data)
  }

  public eq(value: Expression): Condition
  public eq(value: null|string|TextColumn): Condition
  public eq(value: null|string|TextColumn|Expression): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|string): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    const binder = new Binder(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public ne(value: Expression): Condition
  public ne(value: null|string|TextColumn): Condition
  public ne(value: null|string|TextColumn|Expression): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public ne$(value: null|string): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    const binder = new Binder(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public concat(value: TextLike): Expression {
    return new Expression(this, TextOperator.CONCAT, value)
  }
}
