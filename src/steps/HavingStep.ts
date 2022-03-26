import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition } from '../models'
import { OrderByArgsElement } from '../orderBy'
import { All } from '../singletoneConstants'
import { LimitStep, LogicalOperator, OffsetStep, OrderByStep, HavingAndStep, HavingOrStep } from './steps'

export class HavingStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  public and(condition: Condition): HavingAndStep
  public and(left: Condition, operator: LogicalOperator, right: Condition): HavingAndStep
  public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingAndStep
  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingAndStep {
    this.data.havingParts.push(LogicalOperator.AND)
    this.addHavingParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  public or(condition: Condition): HavingOrStep
  public or(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep
  public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep
  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingOrStep {
    this.data.havingParts.push(LogicalOperator.OR)
    this.addHavingParts(cond1, op1, cond2, op2, cond3)
    return this
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
