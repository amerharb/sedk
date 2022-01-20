import { Database, Table } from './schema'
import { Condition } from './models'
import { BinderStore } from './binder'
import { Step, SelectStep, Parenthesis, LogicalOperator, ColumnLike } from './steps'

export type BuilderData = {
  dbSchema: Database,
  //TODO: make table array ot another kind of collection object when we add leftOperand inner join step
  table?: Table,
  columns: ColumnLike[],
  whereParts: (LogicalOperator|Condition|Parenthesis)[],
  binderStore: BinderStore,
  option: BuilderOption,
}

export type BuilderOption = {
  useSemicolonAtTheEnd?: boolean
}

export class Builder {
  private readonly data: BuilderData
  private rootStep: Step

  private static readonly defaultOption: BuilderOption = {
    useSemicolonAtTheEnd: true,
  }

  constructor(database: Database, option?: BuilderOption) {
    this.data = {
      dbSchema: database,
      table: undefined,
      columns: [],
      whereParts: [],
      binderStore: BinderStore.getInstance(),
      option: Builder.fillUndefinedOptionsWithDefault(option),
    }
    this.rootStep = new Step(this.data)
  }

  public select(...items: (ColumnLike|string|number|boolean)[]): SelectStep {
    //Note: the cleanup needed as there is only one "select" step in the chain that we start with
    this.rootStep.cleanUp()
    return this.rootStep.select(...items)
  }

  private static fillUndefinedOptionsWithDefault(option?: BuilderOption): BuilderOption {
    const result: BuilderOption = {}
    result.useSemicolonAtTheEnd = option?.useSemicolonAtTheEnd ?? this.defaultOption.useSemicolonAtTheEnd
    return result
  }
}
