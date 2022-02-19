import { Condition, Expression, PostgresBinder } from './models'
import { Column, Table } from './schema'
import { ColumnNotFoundError, TableNotFoundError } from './errors'
import { BuilderData } from './builder'
import { All, Asterisk } from './singletoneConstants'
import {
  OrderByItem,
  OrderByItemInfo,
  OrderByDirection,
  OrderByNullsPosition,
  OrderByArgsElement,
} from './orderBy'
import { SelectItemInfo } from './select'
import { escapeDoubleQuote } from './util'

export type ColumnLike = Column|Expression
export type PrimitiveType = null|boolean|number|string

export type SelectItem = ColumnLike|Asterisk

export class Step implements BaseStep, RootStep, SelectStep, FromStep, AndStep,
  OrStep, OrderByStep, LimitStep, OffsetStep {
  constructor(protected data: BuilderData) {}

  public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    const selectItemInfos: SelectItemInfo[] = items.map(it => {
      if (it instanceof SelectItemInfo) {
        it.builderOption = this.data.option
        return it
      } else if (it instanceof Expression || it instanceof Column || it instanceof Asterisk) {
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
    return this
  }

  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): AndStep {
    this.data.whereParts.push(AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): OrStep {
    this.data.whereParts.push(OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  orderBy(...orderByArgsElement: OrderByArgsElement[]): OrderByStep {
    if (orderByArgsElement.length === 0) {
      throw new Error('Order by should have at lease one item')
    }
    type StoreType = { orderByItem?: OrderByItem, direction?: OrderByDirection, nulllsPos?: OrderByNullsPosition }
    const store: StoreType = { orderByItem: undefined, direction: undefined, nulllsPos: undefined }
    const pushWhenOrderByDefined = () => {
      if (store.orderByItem !== undefined) {
        this.data.orderByItemInfos.push(new OrderByItemInfo(
          store.orderByItem,
          store.direction,
          store.nulllsPos,
          this.data.option,
        ))
        store.orderByItem = undefined
        store.direction = undefined
        store.nulllsPos = undefined
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
        if (store.nulllsPos !== undefined)
          throw new Error(`${it} shouldn't come directly after "NULLS FIRST" or "NULLS LAST" without column or alias in between`)
        store.nulllsPos = it
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
    this.data.limit = this.data.binderStore.add(n)
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
    this.data.offset = this.data.binderStore.add(n)
    return this
  }

  public getSQL(): string {
    return this.getStatement()
  }

  public getBinds(): PostgresBinder {
    return {
      sql: this.getStatement(),
      values: this.data.binderStore.getValues(),
    }
  }

  private getStatement(): string {
    let result = `SELECT${this.data.distinct}`

    if (this.data.selectItemInfos.length > 0) {
      result += ` ${this.data.selectItemInfos.join(', ')}`
    }

    if (this.data.table) {
      result += ` FROM ${this.data.table}`
    }

    if (this.data.whereParts.length > 0) {
      this.throwIfWherePartsInvalid()
      result += ` WHERE ${this.data.whereParts.join(' ')}`
    }

    if (this.data.orderByItemInfos.length > 0) {
      result += ` ORDER BY ${this.data.orderByItemInfos.join(', ')}`
    }

    if (this.data.limit !== undefined) {
      if (this.data.limit === null) {
        result += ' LIMIT NULL'
      } else {
        result += ` LIMIT ${this.data.limit}`
      }
    }

    if (this.data.offset !== undefined) {
      result += ` OFFSET ${this.data.offset}`
    }

    if (this.data.option.useSemicolonAtTheEnd)
      result += ';'

    return result
  }

  public cleanUp() {
    this.data.selectItemInfos.length = 0
    this.data.distinct = ''
    this.data.table = undefined
    this.data.whereParts.length = 0
    this.data.orderByItemInfos.length = 0
    this.data.limit = undefined
    this.data.offset = undefined
    this.data.binderStore.cleanUp()
  }

  /**
   * This function throws error if WhereParts Array where invalid
   * it check the number of open and close parentheses in the conditions
   */
  private throwIfWherePartsInvalid() {
    let pCounter = 0
    for (let i = 0; i < this.data.whereParts.length; i++) {
      if (this.data.whereParts[i] === Parenthesis.Open) {
        pCounter++
        if (i < this.data.whereParts.length - 1)
          if (this.data.whereParts[i + 1] === Parenthesis.Close) {
            throw new Error('invalid conditions build, empty parenthesis is not allowed')
          }
      }

      if (this.data.whereParts[i] === Parenthesis.Close)
        pCounter--

      if (pCounter < 0) {// Close comes before Open
        throw new Error('invalid conditions build, closing parentheses must occur after Opening one')
      }
    }

    if (pCounter > 0) // Opening more than closing
      throw new Error('invalid conditions build, opening parentheses is more than closing ones')

    if (pCounter < 0) // Closing more than opening
      throw new Error('invalid conditions build, closing parentheses is more than opening ones')
  }

  private throwIfTableNotInDb(table: Table) {
    if (!this.data.schema.isTableExist(table))
      throw new TableNotFoundError(`Table: ${table} not found`)
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
      if (this.data.schema.getTables().find(it  => {
        try {
          return it === item.table
        } catch (err) {
          //TODO: change here when this error got it's own class
          if (err instanceof Error && err.message === 'Table was not assigned')
            return false
        }
      }) === undefined) { // currently, there is only one table in the query
        throw new ColumnNotFoundError(`Column: ${item} not found in database`)
      }
    }
  }

  private addWhereParts(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
    if (op1 === undefined && cond2 === undefined) {
      this.data.whereParts.push(cond1)
    } else if (op1 !== undefined && cond2 !== undefined) {
      this.data.whereParts.push(Parenthesis.Open)
      this.data.whereParts.push(cond1)
      this.data.whereParts.push(op1)
      this.data.whereParts.push(cond2)
      if (op2 !== undefined && cond3 !== undefined) {
        this.data.whereParts.push(op2)
        this.data.whereParts.push(cond3)
      }
      this.data.whereParts.push(Parenthesis.Close)
    }
  }
}

//@formatter:off
interface BaseStep {
  getSQL(): string
  getBinds(): PostgresBinder
  cleanUp(): void
}

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

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface WhereStep extends BaseStep {
  and(condition: Condition): AndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): AndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): AndStep

  or(condition: Condition): OrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): OrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): OrStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface AndStep extends BaseStep {
  and(condition: Condition): AndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): AndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): AndStep

  or(condition: Condition): OrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): OrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): OrStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface OrStep extends BaseStep {
  or(condition: Condition): OrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): OrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): OrStep

  and(condition: Condition): AndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): AndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): AndStep

  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface OrderByStep extends BaseStep {
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface LimitStep extends BaseStep {
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface OffsetStep extends BaseStep {}

//@formatter:on

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

//Aliases
const AND = LogicalOperator.AND
const OR = LogicalOperator.OR

export enum Parenthesis {
  Open = '(',
  Close = ')',
}
