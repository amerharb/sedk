import { Database, Table } from './database'
import { BooleanColumn, Column } from './columns'
import { PrimitiveType } from './models/types'
import { Condition } from './models/Condition'
import { Binder, BinderStore } from './binder'
import { ASTERISK, Distinct, All } from './singletoneConstants'
import { RootStep, SelectStep, FromStep, DeleteFromStep } from './steps/stepInterfaces'
import { Step, SelectItem } from './steps/Step'
import { LogicalOperator } from './operators'
import { Parenthesis } from './steps/BaseStep'
import { OrderByItemInfo } from './orderBy'
import { SelectItemInfo } from './SelectItemInfo'
import { BuilderOption, BuilderOptionRequired, fillUndefinedOptionsWithDefault } from './option'
import { MoreThanOneDistinctOrAllError } from './errors'
import { FromItemInfo } from './FromItemInfo'

export enum SqlPath {
  SELECT = 'SELECT',
  DELETE = 'DELETE',
  // TODO: support the following
  // INSERT = 'INSERT',
  // UPDATE = 'UPDATE',
}

export type BuilderData = {
  step?: Step,
  database: Database,
  option: BuilderOptionRequired,
  /** Below data used to generate SQL statement */
  sqlPath?: SqlPath
  selectItemInfos: SelectItemInfo[],
  fromItemInfos: FromItemInfo[],
  distinct: ''|' DISTINCT'|' ALL'
  whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
  groupByItems: Column[],
  havingParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
  orderByItemInfos: OrderByItemInfo[],
  limit?: null|number|Binder|All,
  offset?: number|Binder,
  binderStore: BinderStore,
}

export class Builder {
  private readonly data: BuilderData
  private rootStep: RootStep

  constructor(database: Database, option?: BuilderOption) {
    this.data = {
      database: database,
      fromItemInfos: [],
      sqlPath: undefined,
      selectItemInfos: [],
      distinct: '',
      whereParts: [],
      groupByItems: [],
      havingParts: [],
      orderByItemInfos: [],
      binderStore: new BinderStore(),
      option: fillUndefinedOptionsWithDefault(option ?? {}),
    }
    this.rootStep = new Step(this.data)
  }

  public select(distinct: Distinct|All, ...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
  public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
  public select(...items: (Distinct|All|SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    if (items[0] instanceof Distinct) {
      if (items.length <= 1) throw new Error('Select step must have at least one parameter after DISTINCT')
      items.shift() //remove first item the DISTINCT item
      Builder.throwIfMoreThanOneDistinctOrAll(items)
      const newItems = items as unknown[] as (SelectItemInfo|SelectItem|PrimitiveType)[]
      return this.rootStep.selectDistinct(...newItems)
    }

    if (items[0] instanceof All) {
      items.shift() //remove first item the ALL item
      Builder.throwIfMoreThanOneDistinctOrAll(items)
      const newItems = items as (SelectItemInfo|SelectItem|PrimitiveType)[]
      return this.rootStep.selectAll(...newItems)
    }

    Builder.throwIfMoreThanOneDistinctOrAll(items)
    const newItems = items as (SelectItemInfo|SelectItem|PrimitiveType)[]
    return this.rootStep.select(...newItems)
  }

  public selectDistinct(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    return this.rootStep.selectDistinct(...items)
  }

  public selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    return this.rootStep.selectAll(...items)
  }

  public selectAsteriskFrom(...tables: Table[]): FromStep {
    return this.rootStep.select(ASTERISK).from(...tables)
  }

  public deleteFrom(...tables: Table[]): DeleteFromStep {
    return this.rootStep.delete().from(...tables)
  }

  public cleanUp(): Builder {
    this.rootStep.cleanUp()
    return this
  }

  private static throwIfMoreThanOneDistinctOrAll(items: (Distinct|All|SelectItemInfo|SelectItem|PrimitiveType)[]) {
    items.forEach(it => {
      if (it instanceof Distinct || it instanceof All)
        throw new MoreThanOneDistinctOrAllError('You can not have more than one DISTINCT or ALL')
    })
  }
}
