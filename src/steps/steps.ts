import { Condition, Expression } from '../models'
import { Column } from '../columns'
import { Table } from '../database'
import { ColumnNotFoundError, TableNotFoundError } from '../errors'
import { BuilderData } from '../builder'
import { All, Asterisk } from '../singletoneConstants'
import {
  OrderByItem,
  OrderByItemInfo,
  OrderByDirection,
  OrderByNullsPosition,
  OrderByArgsElement,
} from '../orderBy'
import { SelectItemInfo } from '../select'
import { escapeDoubleQuote } from '../util'
import { AggregateFunction } from '../aggregateFunction'
import { Binder } from '../binder'
import { BaseStep } from './BaseStep'
import { WhereStep } from './WhereStep'
import { HavingStep } from './HavingStep'

export type ColumnLike = Column|Expression
export type PrimitiveType = null|boolean|number|string

export type SelectItem = ColumnLike|AggregateFunction|Binder|Asterisk

export class Step extends BaseStep implements RootStep, SelectStep, FromStep, GroupByStep,
  OrderByStep, LimitStep, OffsetStep {
  constructor(protected data: BuilderData) {
    super(data)
    data.step = this
  }

  public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    const selectItemInfos: SelectItemInfo[] = items.map(it => {
      if (it instanceof SelectItemInfo) {
        it.builderOption = this.data.option
        return it
      } else if (it instanceof Expression || it instanceof Column || it instanceof AggregateFunction || it instanceof Asterisk) {
        return new SelectItemInfo(it, undefined, this.data.option)
      } else if (it instanceof Binder) {
        if (it.no === undefined) {
          this.data.binderStore.add(it)
        }
        return new SelectItemInfo(it, undefined, this.data.option)
      } else {
        return new SelectItemInfo(new Expression(it), undefined, this.data.option)
      }
    })
    this.throwIfColumnsNotInDb(selectItemInfos)
    this.data.selectItemInfos.push(...selectItemInfos)
    return this
  }

  public selectDistinct(...items: (SelectItem|PrimitiveType)[]): SelectStep {
    this.data.distinct = ' DISTINCT'
    return this.select(...items)
  }

  public selectAll(...items: (SelectItem|PrimitiveType)[]): SelectStep {
    this.data.distinct = ' ALL'
    return this.select(...items)
  }

  public from(table: Table): FromStep {
    this.throwIfTableNotInDb(table)
    this.data.table = table
    return this
  }

  public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): WhereStep {
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return new WhereStep(this.data)
  }

  public groupBy(...groupByItems: Column[]): GroupByStep {
    this.data.groupByItems.push(...groupByItems)
    return this
  }

  public having(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingStep {
    this.addHavingParts(cond1, op1, cond2, op2, cond3)
    return new HavingStep(this.data)
  }

  public orderBy(...orderByArgsElement: OrderByArgsElement[]): OrderByStep {
    if (orderByArgsElement.length === 0) {
      throw new Error('Order by should have at lease one item')
    }
    type StoreType = { orderByItem?: OrderByItem, direction?: OrderByDirection, nullsPos?: OrderByNullsPosition }
    const store: StoreType = { orderByItem: undefined, direction: undefined, nullsPos: undefined }
    const pushWhenOrderByDefined = () => {
      if (store.orderByItem !== undefined) {
        this.data.orderByItemInfos.push(new OrderByItemInfo(
          store.orderByItem,
          store.direction,
          store.nullsPos,
          this.data.option,
        ))
        store.orderByItem = undefined
        store.direction = undefined
        store.nullsPos = undefined
      }
    }

    orderByArgsElement.forEach(it => {
      if (it instanceof OrderByDirection) {
        if (store.orderByItem === undefined)
          throw new Error(`${it} expects to have column or alias before it`)
        if (store.direction !== undefined)
          throw new Error(`${it} shouldn't come after "ASC" or "DESC" without column or alias in between`)
        store.direction = it
      } else if (it instanceof OrderByNullsPosition) {
        if (store.orderByItem === undefined)
          throw new Error(`${it} expects to have column or alias before it`)
        if (store.nullsPos !== undefined)
          throw new Error(`${it} shouldn't come directly after "NULLS FIRST" or "NULLS LAST" without column or alias in between`)
        store.nullsPos = it
        pushWhenOrderByDefined()
      } else if (it instanceof OrderByItemInfo) {
        pushWhenOrderByDefined()
        it.builderOption = this.data.option
        this.data.orderByItemInfos.push(it)
      } else if (it instanceof Column) {
        pushWhenOrderByDefined()
        store.orderByItem = it
      } else if (it instanceof Expression) {
        pushWhenOrderByDefined()
        store.orderByItem = it
      } else { //it is a string
        pushWhenOrderByDefined()
        //look for the alias
        if (this.data.selectItemInfos.find(info => info.alias === it)) {
          store.orderByItem = `"${escapeDoubleQuote(it)}"`
        } else {
          throw new Error(`Alias ${it} is not exist, if this is a column, then it should be entered as Column class`)
        }
      }
    })
    pushWhenOrderByDefined()
    return this
  }

  public limit(n: null|number|All): LimitStep {
    if (typeof n === 'number' && n < 0) {
      throw new Error(`Invalid limit value ${n}, negative numbers are not allowed`)
    }
    this.data.limit = n
    return this
  }

  public limit$(n: null|number): LimitStep {
    if (typeof n === 'number' && n < 0) {
      throw new Error(`Invalid limit value ${n}, negative numbers are not allowed`)
    }
    const binder = new Binder(n)
    this.data.binderStore.add(binder)
    this.data.limit = binder
    return this
  }

  public offset(n: number): OffsetStep {
    if (n < 0) {
      throw new Error(`Invalid offset value ${n}, negative numbers are not allowed`)
    }
    this.data.offset = n
    return this
  }

  public offset$(n: number): OffsetStep {
    if (n < 0) {
      throw new Error(`Invalid offset value ${n}, negative numbers are not allowed`)
    }
    const binder = new Binder(n)
    this.data.binderStore.add(binder)
    this.data.offset = binder
    return this
  }

  private throwIfTableNotInDb(table: Table) {
    if (!this.data.database.isTableExist(table))
      throw new TableNotFoundError(`Table: "${table.name}" not found`)
  }

  private throwIfColumnsNotInDb(columns: (SelectItemInfo|ColumnLike|Asterisk)[]) {
    for (const item of columns) {
      if (item instanceof Asterisk) {
        continue
      } else if (item instanceof Expression) {
        this.throwIfColumnsNotInDb(item.getColumns())
        continue
      } else if (item instanceof SelectItemInfo) {
        this.throwIfColumnsNotInDb(item.getColumns())
        continue
      }
      // item is Column from here
      if (!this.data.database.isColumnExist(item)) {
        throw new ColumnNotFoundError(`Column: "${item.name}" not found in database`)
      }
    }
  }
}

//@formatter:off
export interface RootStep extends BaseStep {
  select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
  selectDistinct(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
  selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
}

export interface SelectStep extends BaseStep {
  from(table: Table): FromStep
}

export interface FromStep extends BaseStep {
  where(condition: Condition): WhereStep
  where(left: Condition, operator: LogicalOperator, right: Condition): WhereStep
  where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereStep

  groupBy(...groupByItems: Column[]): GroupByStep
  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

export interface WhereAndStep extends BaseStep {
  and(condition: Condition): WhereAndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): WhereAndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereAndStep

  or(condition: Condition): WhereOrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): WhereOrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereOrStep

  groupBy(...groupByItems: Column[]): GroupByStep
  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

export interface WhereOrStep extends BaseStep {
  or(condition: Condition): WhereOrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): WhereOrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereOrStep

  and(condition: Condition): WhereAndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): WhereAndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereAndStep

  groupBy(...groupByItems: Column[]): GroupByStep
  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

export interface GroupByStep extends BaseStep {
  having(condition: Condition): HavingStep
  having(left: Condition, operator: LogicalOperator, right: Condition): HavingStep
  having(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

export interface HavingOrStep extends BaseStep {
  or(condition: Condition): HavingOrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep

  and(condition: Condition): HavingAndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

export interface HavingAndStep extends BaseStep {
  and(condition: Condition): HavingAndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep

  or(condition: Condition): HavingOrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep

  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

export interface OrderByStep extends BaseStep {
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

export interface LimitStep extends BaseStep {
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

export interface OffsetStep extends BaseStep {}
//@formatter:on

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum Parenthesis {
  Open = '(',
  Close = ')',
}
