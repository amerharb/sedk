import { BaseStep } from './BaseStep'
import { BuilderData } from './builder'
import { Condition } from './models'
import { Column } from './columns'
import { OrderByArgsElement } from './orderBy'
import { All } from './singletoneConstants'
import { GroupByStep, LimitStep, LogicalOperator, OffsetStep, OrderByStep, WhereAndStep, WhereOrStep } from './steps'

export class WhereStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  public and(condition: Condition): WhereAndStep
  public and(left: Condition, operator: LogicalOperator, right: Condition): WhereAndStep
  public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereAndStep
  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): WhereAndStep {
    this.data.whereParts.push(LogicalOperator.AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  public or(condition: Condition): WhereOrStep
  public or(left: Condition, operator: LogicalOperator, right: Condition): WhereOrStep
  public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereOrStep
  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): WhereOrStep {
    this.data.whereParts.push(LogicalOperator.OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  public groupBy(...groupByItems: Column[]): GroupByStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.groupBy(...groupByItems)
  }

  public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.orderBy(...orderByItems)
  }

  public limit(n: null|number|All): LimitStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.limit(n)
  }

  public limit$(n: null|number): LimitStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.limit$(n)
  }

  public offset(n: number): OffsetStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.offset(n)
  }

  public offset$(n: number): OffsetStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.offset$(n)
  }
}
