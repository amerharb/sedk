import { BooleanColumn, Table } from '../../database/index.ts'
import { FromItem } from '../select-path/SelectFromStep.ts'
import { Artifacts, BaseStep, Parenthesis } from '../BaseStep.ts'
import { Condition, PrimitiveType } from '../../models/index.ts'
import { DeleteWhereStep } from './DeleteConditionStep.ts'
import { LogicalOperator } from '../../operators.ts'
import { ReturningStep } from '../ReturningStep.ts'
import { ReturningItem } from '../../ReturningItemInfo.ts'
import { ItemInfo } from '../../ItemInfo.ts'

export class DeleteFromStep extends BaseStep {
	constructor(
		prevStep: BaseStep,
		protected readonly fromItem: FromItem,
	) {
		super(prevStep)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return 'FROM ' + this.fromItem.getStmt(this.data, artifacts)
	}

	getStepArtifacts(): Artifacts {
		const table = this.fromItem instanceof Table ? this.fromItem : this.fromItem.table
		return { tables: new Set([table]), columns: new Set() }
	}

	public where(condition: Condition): DeleteWhereStep
	public where(left: Condition, operator: LogicalOperator, right: Condition): DeleteWhereStep
	public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): DeleteWhereStep
	public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): DeleteWhereStep {
		const whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new DeleteWhereStep(this, whereParts)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this, items)
	}
}
