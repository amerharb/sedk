import { PrimitiveType } from '../models/types'
import { Condition } from '../models/Condition'
import { Expression } from '../models/Expression'
import { Column } from '../columns'
import { AliasedTable, Table } from '../database'
import { ColumnNotFoundError, MoreThanOneWhereStepError, TableNotFoundError } from '../errors'
import { BuilderData, SqlPath } from '../builder'
import { All, Asterisk } from '../singletoneConstants'
import { OrderByArgsElement, OrderByDirection, OrderByItem, OrderByItemInfo, OrderByNullsPosition } from '../orderBy'
import { SelectItemInfo } from '../SelectItemInfo'
import { escapeDoubleQuote } from '../util'
import { AggregateFunction } from '../AggregateFunction'
import { Binder } from '../binder'
import { BaseStep } from './BaseStep'
import { SelectWhereStep } from './SelectWhereStep'
import { HavingStep } from './HavingStep'
import {
  RootStep, SelectStep, DeleteStep, SelectFromStep, DeleteFromStep, CrossJoinStep, JoinStep, LeftJoinStep,
  RightJoinStep, InnerJoinStep, FullOuterJoinStep, GroupByStep, OrderByStep, LimitStep, OffsetStep,
} from './stepInterfaces'
import { LogicalOperator } from '../operators'
import { FromItemInfo, FromItemRelation } from '../FromItemInfo'
import { OnStep } from './OnStep'

export type ColumnLike = Column|Expression

export type SelectItem = ColumnLike|AggregateFunction|Binder|Asterisk

export class Step extends BaseStep
  implements RootStep, SelectStep, DeleteStep, SelectFromStep, DeleteFromStep, CrossJoinStep, JoinStep, LeftJoinStep,
    RightJoinStep, InnerJoinStep, FullOuterJoinStep, GroupByStep, OrderByStep, LimitStep, OffsetStep {
  constructor(protected data: BuilderData) {
    super(data)
    data.step = this
  }

  public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    this.data.sqlPath = SqlPath.SELECT
    const selectItemInfos: SelectItemInfo[] = items.map(it => {
      if (it instanceof SelectItemInfo) {
        return it
      } else if (it instanceof Expression || it instanceof Column || it instanceof AggregateFunction || it instanceof Asterisk) {
        return new SelectItemInfo(it, undefined)
      } else if (it instanceof Binder) {
        if (it.no === undefined) {
          this.data.binderStore.add(it)
        }
        return new SelectItemInfo(it, undefined)
      } else {
        return new SelectItemInfo(new Expression(it), undefined)
      }
    })
    this.throwIfColumnsNotInDb(selectItemInfos)
    this.data.selectItemInfos.push(...selectItemInfos)
    return this
  }

  public selectDistinct(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    this.data.sqlPath = SqlPath.SELECT
    this.data.distinct = ' DISTINCT'
    return this.select(...items)
  }

  public selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    this.data.sqlPath = SqlPath.SELECT
    this.data.distinct = ' ALL'
    return this.select(...items)
  }

  public delete(): DeleteStep {
    this.data.sqlPath = SqlPath.DELETE
    return this
  }

  public from(...tables: (Table|AliasedTable)[]): SelectFromStep {
    if (tables.length === 0)
      throw new Error('No tables specified')

    tables.forEach(table => {
      this.throwIfTableNotInDb(Step.getTable(table))
    })

    for (let i = 0; i < tables.length; i++) {
      this.addFromItemInfo(tables[i], i === 0 ? FromItemRelation.NO_RELATION : FromItemRelation.COMMA)
    }
    return this
  }

  public crossJoin(table: Table|AliasedTable): CrossJoinStep {
    this.addFromItemInfo(table, FromItemRelation.CROSS_JOIN)
    return this
  }

  public join(table: Table|AliasedTable): JoinStep {
    this.addFromItemInfo(table, FromItemRelation.JOIN)
    return this
  }

  public leftJoin(table: Table|AliasedTable): LeftJoinStep {
    this.addFromItemInfo(table, FromItemRelation.LEFT_JOIN)
    return this
  }

  public rightJoin(table: Table|AliasedTable): RightJoinStep {
    this.addFromItemInfo(table, FromItemRelation.RIGHT_JOIN)
    return this
  }

  public innerJoin(table: Table|AliasedTable): InnerJoinStep {
    this.addFromItemInfo(table, FromItemRelation.INNER_JOIN)
    return this
  }

  public fullOuterJoin(table: Table|AliasedTable): FullOuterJoinStep {
    this.addFromItemInfo(table, FromItemRelation.FULL_OUTER_JOIN)
    return this
  }

  private addFromItemInfo(table: Table|AliasedTable, relation: FromItemRelation) {
    this.throwIfTableNotInDb(Step.getTable(table))
    this.data.fromItemInfos.push(new FromItemInfo(
      Step.getTable(table),
      relation,
      table instanceof AliasedTable ? table.alias : undefined,
    ))
  }

  public on(condition: Condition): OnStep {
    this.data.fromItemInfos[this.data.fromItemInfos.length - 1].addFirstCondition(condition)
    return new OnStep(this.data)
  }

  private static getTable(tableOrAliasedTable: Table|AliasedTable): Table {
    if (tableOrAliasedTable instanceof Table)
      return tableOrAliasedTable
    else
      return tableOrAliasedTable.table
  }

  public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): SelectWhereStep {
    if (this.data.whereParts.length > 0) {
      throw new MoreThanOneWhereStepError('WHERE step already specified')
    }
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return new SelectWhereStep(this.data)
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
    const pushWhenOrderByItemDefined = () => {
      if (store.orderByItem !== undefined) {
        this.data.orderByItemInfos.push(new OrderByItemInfo(
          store.orderByItem,
          store.direction,
          store.nullsPos,
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
        pushWhenOrderByItemDefined()
      } else if (it instanceof OrderByItemInfo) {
        pushWhenOrderByItemDefined()
        this.data.orderByItemInfos.push(it)
      } else if (it instanceof Column) {
        pushWhenOrderByItemDefined()
        store.orderByItem = it
      } else if (it instanceof Expression) {
        pushWhenOrderByItemDefined()
        store.orderByItem = it
      } else { //it is a string
        pushWhenOrderByItemDefined()
        //look for the alias
        if (this.data.selectItemInfos.find(info => info.alias === it)) {
          store.orderByItem = `"${escapeDoubleQuote(it)}"`
        } else {
          throw new Error(`Alias ${it} is not exist, if this is a column, then it should be entered as Column class`)
        }
      }
    })
    pushWhenOrderByItemDefined()
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
    if (!this.data.database.hasTable(table))
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
      if (!this.data.database.hasColumn(item)) {
        throw new ColumnNotFoundError(`Column: "${item.name}" not found in database`)
      }
    }
  }
}
