import { BooleanColumn } from '../../database'
import { FromItem } from '../Step'
import { BaseStep, Parenthesis } from '../BaseStep'
import { BuilderData } from '../../builder'
import { Condition, PrimitiveType } from '../../models'
import { DeleteWhereStep } from './DeleteConditionStep'
import { LogicalOperator } from '../../operators'
import { ReturningStep } from '../ReturningStep'
import { returnStepOrThrow } from '../../util'
import { ReturningItem } from '../../ReturningItemInfo'
import { ItemInfo } from '../../ItemInfo'

export class DeleteFromStep extends BaseStep {
	constructor(
		protected readonly data: BuilderData,
		protected readonly prevStep: BaseStep,
		protected readonly table: FromItem
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		return 'FROM ' + this.table.getStmt(this.data)
	}

	public where(condition: Condition): DeleteWhereStep
	public where(left: Condition, operator: LogicalOperator, right: Condition): DeleteWhereStep
	public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): DeleteWhereStep
	public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): DeleteWhereStep {
		const whereParts:(LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new DeleteWhereStep(this.data, this, whereParts)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return returnStepOrThrow(this.data.step).returning(...items)
	}
}
