import { BaseStep, Parenthesis } from '../BaseStep'
import { BuilderData } from '../../builder'
import { Condition, Expression, PrimitiveType } from '../../models'
import { BooleanColumn, Column } from '../../database'
import { OrderByArgsElement } from '../../orderBy'
import { All } from '../../singletoneConstants'
import {
	GroupByStep,
	LimitStep,
	OffsetStep,
	OrderByStep,
	ReturningStep,
} from '../stepInterfaces'
import { LogicalOperator } from '../../operators'
import { returnStepOrThrow } from '../../util'
import { ItemInfo } from '../../ItemInfo'
import { ReturningItem } from '../../ReturningItemInfo'

abstract class SelectConditionStep extends BaseStep {
	protected constructor(
		protected readonly conditionName: 'WHERE' | 'AND' | 'OR',
		data: BuilderData,
		prevStep: BaseStep,
		protected readonly whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		if (this.whereParts.length > 0) {
			BaseStep.throwIfConditionPartsInvalid(this.whereParts)
			const wherePartsString = this.whereParts.map(it => {
				if (it instanceof Condition || it instanceof Expression || it instanceof BooleanColumn) {
					return it.getStmt(this.data)
				}
				return it.toString()
			})
			return `${this.conditionName} ${wherePartsString.join(' ')}`
		}
		return ''
	}

	public and(condition: Condition): SelectWhereAndStep
	public and(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereAndStep
	public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereAndStep
	public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): SelectWhereAndStep {
		const whereParts:(LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new SelectWhereAndStep(this.data, this, whereParts)
	}

	public or(condition: Condition): SelectWhereOrStep
	public or(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereOrStep
	public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereOrStep
	public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): SelectWhereOrStep {
		const whereParts:(LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []
		BaseStep.addConditionParts(whereParts, cond1, op1, cond2, op2, cond3)
		return new SelectWhereOrStep(this.data, this, whereParts)
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

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return returnStepOrThrow(this.data.step).returning(...items)
	}
}

export class SelectWhereStep extends SelectConditionStep {
	constructor(data: BuilderData, prevStep: BaseStep, whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[]) {
		super('WHERE', data, prevStep, whereParts)
	}
}

export class SelectWhereAndStep extends SelectConditionStep {
	constructor(data: BuilderData, prevStep: BaseStep, whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[]) {
		super('AND', data, prevStep, whereParts)
	}
}

export class SelectWhereOrStep extends SelectConditionStep {
	constructor(data: BuilderData, prevStep: BaseStep, whereParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[]) {
		super('OR', data, prevStep, whereParts)
	}
}
