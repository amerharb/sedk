import { BooleanColumn, Table } from '../../database'
import { FromItem } from '../Step'
import { Artifacts, BaseStep, Parenthesis } from '../BaseStep'
import { BuilderData } from '../../builder'
import { Condition, PrimitiveType } from '../../models'
import { DeleteWhereStep } from './DeleteConditionStep'
import { LogicalOperator } from '../../operators'
import { ReturningStep } from '../ReturningStep'
import { ReturningItem } from '../../ReturningItemInfo'
import { ItemInfo } from '../../ItemInfo'

export class DeleteFromStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		protected readonly table: FromItem
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		return 'FROM ' + this.table.getStmt(this.data)
	}

	protected getStepArtifacts(): Artifacts {
		const table = this.table instanceof Table ? this.table : this.table.table
		return { tables: new Set([table]), columns: new Set() }
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
		return new ReturningStep(this.data, this, items)
	}
}
