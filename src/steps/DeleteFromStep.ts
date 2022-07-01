import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition } from '../models/Condition'
import { DeleteWhereStep } from './DeleteWhereStep'
import { LogicalOperator } from '../operators'
import { MoreThanOneWhereStepError } from '../errors'

export class DeleteFromStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  public where(condition: Condition): DeleteWhereStep
  public where(left: Condition, operator: LogicalOperator, right: Condition): DeleteWhereStep
  public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): DeleteWhereStep
  public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): DeleteWhereStep {
    if (this.data.whereParts.length > 0) {
      throw new MoreThanOneWhereStepError('WHERE step already specified')
    }
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return new DeleteWhereStep(this.data)
  }
}