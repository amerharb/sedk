import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition } from '../models/Condition'
import { Column } from '../columns'
import { OrderByArgsElement } from '../orderBy'
import { All } from '../singletoneConstants'
import { GroupByStep, LimitStep, OffsetStep, OrderByStep, WhereAndStep, WhereOrStep } from './stepInterfaces'
import { LogicalOperator } from '../operators'
import { returnStepOrThrow } from '../util'

export class SelectWhereStep extends BaseStep {
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
    return returnStepOrThrow(this.data.step).groupBy(...groupByItems)
  }

  public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
    return returnStepOrThrow(this.data.step).orderBy(...orderByItems)
  }

  public limit(n: null|number|All): LimitStep {
    return returnStepOrThrow(this.data.step).limit(n)
  }

  public limit$(n: null|number): LimitStep {
    return returnStepOrThrow(this.data.step).limit$(n)
  }

  public offset(n: number): OffsetStep {
    return returnStepOrThrow(this.data.step).offset(n)
  }

  public offset$(n: number): OffsetStep {
    return returnStepOrThrow(this.data.step).offset$(n)
  }
}
