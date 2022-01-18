import {
  Database,
  Table,
  Column,
  Condition,
  Expression,
} from './models'
import { ColumnNotFoundError } from './errors'
import { BinderStore } from './binder'
import { Step, SelectStep, Parenthesis, LogicalOperator } from './steps'

type ColumnLike = Column|Expression

export type BuilderData = {
  dbSchema: Database,
  //TODO: make table array ot another kind of collection object when we add leftOperand inner join step
  table?: Table,
  columns: ColumnLike[],
  whereParts: (LogicalOperator|Condition|Parenthesis)[],
  steps: Step[],
  binderStore: BinderStore,
}

export class Builder {
  private readonly data: BuilderData
  private rootStep: Step

  constructor(database: Database) {
    this.data = {
      dbSchema: database,
      table: undefined,
      columns: [],
      whereParts: [],
      steps: [],
      binderStore: BinderStore.getInstance(),
    }
    this.rootStep = new Step(this.data)
  }

  public select(...items: (ColumnLike|string|number|boolean)[]): SelectStep {
    const columns = items.map(it => {
      if (it instanceof Expression || it instanceof Column)
        return it
      else
        return new Expression(it)
    })
    this.throwIfColumnsNotInDb(columns)
    //Note: the cleanup needed as is one select in the chain also we start with it always
    this.rootStep.cleanUp()
    this.data.columns.push(...columns)
    const step = new SelectStep(this.data)
    this.data.steps.push(step)
    return step
  }

  private throwIfColumnsNotInDb(columns: ColumnLike[]) {
    for (const column of columns) {
      if (column instanceof Expression) {
        this.throwIfColumnsNotInDb(Builder.getColumnsFromExpression(column))
        continue
      }
      // TODO: move search function into database model
      let found = false
      //@formatter:off
      COL:
      //TODO: filter only the table in the current query
      for (const table of this.data.dbSchema.getTables()) {
        for (const col of table.getColumn()) {
          if (column === col) {
            found = true
            break COL
          }
        }
      }
      //@formatter:on
      if (!found)
        throw new ColumnNotFoundError(`Column: ${column} not found`)
    }
  }

  private static getColumnsFromExpression(expression: Expression): Column[] {
    const columns: Column[] = []
    if (expression.leftOperand.value instanceof Column)
      columns.push(expression.leftOperand.value)
    else if (expression.leftOperand.value instanceof Expression)
      columns.push(...Builder.getColumnsFromExpression(expression.leftOperand.value))

    if (expression.rightOperand?.value instanceof Column)
      columns.push(expression.rightOperand.value)
    else if (expression.rightOperand?.value instanceof Expression)
      columns.push(...Builder.getColumnsFromExpression(expression.rightOperand.value))

    return columns
  }
}
