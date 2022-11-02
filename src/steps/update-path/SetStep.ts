import { BooleanColumn } from '../../database'
import { UpdateSetItemInfo } from '../../UpdateSetItemInfo'
import { Artifacts, BaseStep, Parenthesis } from '../BaseStep'
import { Condition, PrimitiveType } from '../../models'
import { UpdateWhereStep } from './UpdateConditionStep'
import { LogicalOperator } from '../../operators'
import { ItemInfo } from '../../ItemInfo'
import { ReturningItem } from '../../ReturningItemInfo'
import { ReturningStep } from '../ReturningStep'

export class SetStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
		private readonly items: UpdateSetItemInfo[],
	) {
		super(prevStep)
	}

	public getStepStatement(): string {
		return `SET ${this.items.map(it => it.getStmt(this.data)).join(', ')}`
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.items.map(it => it.column)) }
	}

	public where(condition: Condition): UpdateWhereStep
	public where(left: Condition, operator: LogicalOperator, right: Condition): UpdateWhereStep
	public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): UpdateWhereStep
	public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): UpdateWhereStep {
		const whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new UpdateWhereStep(this, whereParts)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
	}
}
