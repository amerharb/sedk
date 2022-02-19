import { Schema, Table } from './schema'
import { Condition } from './models'
import { Binder, BinderStore } from './binder'
import { ASTERISK, Distinct, All } from './singletoneConstants'
import {
  Step,
  SelectStep,
  FromStep,
  Parenthesis,
  LogicalOperator,
  SelectItem,
  PrimitiveType,
  RootStep,
} from './steps'
import { OrderByItemInfo } from './orderBy'
import { SelectItemInfo } from './select'
import { BuilderOption, fillUndefinedOptionsWithDefault } from './option'

export type BuilderData = {
  schema: Schema,
  option: BuilderOption,
  /** Below data used to generate SQL statment */
  selectItemInfos: SelectItemInfo[],
  //TODO: make table "FromItemInfo" array
  table?: Table,
  distinct: ''|' DISTINCT'|' ALL'
  whereParts: (LogicalOperator|Condition|Parenthesis)[],
  orderByItemInfos: OrderByItemInfo[],
  limit?: null|number|Binder|All,
  offset?: number|Binder,
  binderStore: BinderStore,
}

export class Builder {
  private readonly data: BuilderData
  private rootStep: RootStep

  constructor(database: Schema, option?: BuilderOption) {
    this.data = {
      schema: database,
      table: undefined,
      selectItemInfos: [],
      distinct: '',
      whereParts: [],
      orderByItemInfos: [],
      binderStore: BinderStore.getInstance(),
      option: fillUndefinedOptionsWithDefault(option ?? {}),
    }
    this.rootStep = new Step(this.data)
  }

  public select(distinct: Distinct|All, ...items: (SelectItem|PrimitiveType)[]): SelectStep
  public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
  public select(...items: (Distinct|All|SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    if (items[0] instanceof Distinct) {
      if (items.length <= 1) throw new Error('Select step must have at least one parameter after DISTINCT')
      this.rootStep.cleanUp()
      items.shift() //remove first item the DISTINCT item
      //TODO: throw error if items contain another DISTINCT or ALL
      const newItems = items as unknown[] as (SelectItemInfo|SelectItem|PrimitiveType)[]
      return this.rootStep.selectDistinct(...newItems)
    }

    if (items[0] instanceof All) {
      this.rootStep.cleanUp()
      items.shift() //remove first item the ALL item
      //TODO: throw error if items contain another ALL or DISTINCT
      const newItems = items as unknown[] as (SelectItemInfo|SelectItem|PrimitiveType)[]
      return this.rootStep.selectAll(...newItems)
    }

    this.rootStep.cleanUp()
    //TODO: throw error if items contain any ALL or DISTINCT
    const newItems = items as unknown[] as (SelectItemInfo|SelectItem|PrimitiveType)[]
    return this.rootStep.select(...newItems)
  }

  public selectDistinct(...items: (SelectItem|PrimitiveType)[]): SelectStep {
    //Note: the cleanup needed as there is only one "select" step in the chain that we start with
    this.rootStep.cleanUp()
    return this.rootStep.selectDistinct(...items)
  }

  public selectAll(...items: (SelectItem|PrimitiveType)[]): SelectStep {
    //Note: the cleanup needed as there is only one "select" step in the chain that we start with
    this.rootStep.cleanUp()
    return this.rootStep.selectAll(...items)
  }

  public selectAsteriskFrom(table: Table): FromStep {
    //Note: the cleanup needed as there is only one "select" step in the chain that we start with
    this.rootStep.cleanUp()
    return this.rootStep.select(ASTERISK).from(table)
  }
}
