import { BooleanColumn } from '../../database/index.ts'
import { UpdateSetItemInfo } from '../../UpdateSetItemInfo.ts'
import { Artifacts, BaseStep, Parenthesis } from '../BaseStep.ts'
import { Condition, PrimitiveType } from '../../models/index.ts'
import { UpdateWhereStep } from './UpdateConditionStep.ts'
import { LogicalOperator } from '../../operators.ts'
import { ItemInfo } from '../../ItemInfo.ts'
import { ReturningItem } from '../../ReturningItemInfo.ts'
import { ReturningStep } from '../ReturningStep.ts'

export class SetStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
		private readonly items: UpdateSetItemInfo[],
	) {
		super(prevStep)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `SET ${this.items.map(it => it.getStmt(this.data, artifacts, this.binderStore)).join(', ')}`
	}

	getStepArtifacts(): Artifacts {
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
