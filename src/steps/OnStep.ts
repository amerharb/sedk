import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition } from '../models/Condition'
import { Column } from '../columns'
import { OrderByArgsElement } from '../orderBy'
import { All } from '../singletoneConstants'
import {
  CrossJoinStep, FullOuterJoinStep, GroupByStep, IAfterFromSteps, InnerJoinStep, JoinStep, LeftJoinStep,
  LimitStep, OffsetStep, OnAndStep, OnOrStep, OrderByStep, RightJoinStep,
} from './stepInterfaces'
import { LogicalOperator } from '../operators'
import { WhereStep } from './WhereStep'
import { Table } from '../database'

export class OnStep extends BaseStep implements IAfterFromSteps {
  constructor(protected data: BuilderData) { super(data) }

  public or(condition: Condition): OnOrStep {
    this.data.fromItemInfos[this.data.fromItemInfos.length - 1].addOrCondition(condition)
    return this
  }

  public and(condition: Condition): OnAndStep {
    this.data.fromItemInfos[this.data.fromItemInfos.length - 1].addAndCondition(condition)
    return this
  }

  public crossJoin(table: Table): CrossJoinStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.crossJoin(table)
  }

  public join(table: Table): JoinStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.join(table)
  }

  public leftJoin(table: Table): LeftJoinStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.leftJoin(table)
  }

  public rightJoin(table: Table): RightJoinStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.rightJoin(table)
  }

  public innerJoin(table: Table): InnerJoinStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.innerJoin(table)
  }

  public fullOuterJoin(table: Table): FullOuterJoinStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step?.fullOuterJoin(table)
  }

  where(condition: Condition): WhereStep
  where(left: Condition, operator: LogicalOperator, right: Condition): WhereStep
  where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereStep
  public where(left: Condition, operator?: LogicalOperator, right?: Condition): WhereStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.where(left, operator, right)
  }

  public groupBy(...groupByItems: Column[]): GroupByStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.groupBy(...groupByItems)
  }

  public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.orderBy(...orderByItems)
  }

  public limit(n: null|number|All): LimitStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.limit(n)
  }

  public limit$(n: null|number): LimitStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.limit$(n)
  }

  public offset(n: number): OffsetStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.offset(n)
  }

  public offset$(n: number): OffsetStep {
    if (this.data.step === undefined) {
      OnStep.throwStepPropertyNotInitializedError()
    }
    return this.data.step.offset$(n)
  }

  private static throwStepPropertyNotInitializedError(): never {
    throw new Error('Step property in builder data is not initialized')
  }
}
