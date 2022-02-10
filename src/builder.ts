import { Database, Table } from './schema'
import { Condition } from './models'
import { BinderStore } from './binder'
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

export type BuilderData = {
  dbSchema: Database,
  //TODO: make table array ot another kind of collection object when we add leftOperand inner join step
  table?: Table,
  selectItems: SelectItem[],
  distinct: ''|' DISTINCT'|' ALL'
  whereParts: (LogicalOperator|Condition|Parenthesis)[],
  orderByItemInfos: OrderByItemInfo[],
  binderStore: BinderStore,
  option: BuilderOption,
}

export type BuilderOption = {
  useSemicolonAtTheEnd?: boolean
  addAscAfterOrderByItem?: 'always'|'never'|'when mentioned'
  addNullsLastAfterOrderByItem?: 'always'|'never'|'when mentioned'
}

export class Builder {
  private readonly data: BuilderData
  private rootStep: RootStep

  private static readonly defaultOption: BuilderOption = {
    useSemicolonAtTheEnd: true,
    addAscAfterOrderByItem: 'when mentioned',
    addNullsLastAfterOrderByItem: 'when mentioned',
  }

  constructor(database: Database, option?: BuilderOption) {
    this.data = {
      dbSchema: database,
      table: undefined,
      selectItems: [],
      distinct: '',
      whereParts: [],
      orderByItemInfos: [],
      binderStore: BinderStore.getInstance(),
      option: Builder.fillUndefinedOptionsWithDefault(option),
    }
    this.rootStep = new Step(this.data)
  }

  public select(distinct: Distinct|All, ...items: (SelectItem|PrimitiveType)[]): SelectStep
  public select(...items: (SelectItem|PrimitiveType)[]): SelectStep
  public select(...items: (Distinct|All|SelectItem|PrimitiveType)[]): SelectStep {
    if (items.length === 0) throw new Error('Select step must have at least one parameter')
    if (items[0] instanceof Distinct) {
      if (items.length === 1) throw new Error('Select step must have at least one parameter after DISTINCT')
      this.rootStep.cleanUp()
      items.shift() //remove first item the DISTINCT item
      return this.rootStep.selectDistinct(...items)
    }

    if (items[0] instanceof All) {
      this.rootStep.cleanUp()
      items.shift() //remove first item the ALL item
      return this.rootStep.selectAll(...items)
    }

    this.rootStep.cleanUp()
    return this.rootStep.select(...items)
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

  private static fillUndefinedOptionsWithDefault(option?: BuilderOption): BuilderOption {
    const result: BuilderOption = {}
    result.useSemicolonAtTheEnd = option?.useSemicolonAtTheEnd ?? this.defaultOption.useSemicolonAtTheEnd
    result.addAscAfterOrderByItem = option?.addAscAfterOrderByItem ?? this.defaultOption.addAscAfterOrderByItem
    result.addNullsLastAfterOrderByItem = option?.addNullsLastAfterOrderByItem ?? this.defaultOption.addNullsLastAfterOrderByItem
    return result
  }
}
