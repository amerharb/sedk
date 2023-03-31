import { BooleanColumn, Table } from '../../database'
import { FromItem } from '../select-path/SelectFromStep'
import { Artifacts, BaseStep, Parenthesis } from '../BaseStep'
import { Condition } from '../../models'
import { DeleteWhereStep } from './DeleteConditionStep'
import { LogicalOperator } from '../../operators'

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
}
