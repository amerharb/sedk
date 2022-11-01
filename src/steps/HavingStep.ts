import { Artifacts, BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition } from '../models'
import { OrderByArgsElement } from '../orderBy'
import { All } from '../singletoneConstants'
import { LogicalOperator } from '../operators'
import { HavingAndStep, HavingOrStep } from './stepInterfaces'
import { returnStepOrThrow } from '../util'
import { OffsetStep } from './select-path/OffsetStep'
import { LimitStep } from './select-path/LimitStep'
import { OrderByStep } from './select-path/OrderByStep'

export class HavingStep extends BaseStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
	) {
		super(data, prevStep)
	}

	public getStepStatement(): string {
		throw new Error('Method not implemented.')
	}

	protected getStepArtifacts(): Artifacts {
		throw new Error('Method not implemented.')
	}

	public and(condition: Condition): HavingAndStep
	public and(left: Condition, operator: LogicalOperator, right: Condition): HavingAndStep
	public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingAndStep
	public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingAndStep {
		this.data.havingParts.push(LogicalOperator.AND)
		this.addHavingParts(cond1, op1, cond2, op2, cond3)
		return this
	}

	public or(condition: Condition): HavingOrStep
	public or(left: Condition, operator: LogicalOperator, right: Condition): HavingOrStep
	public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingOrStep
	public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingOrStep {
		this.data.havingParts.push(LogicalOperator.OR)
		this.addHavingParts(cond1, op1, cond2, op2, cond3)
		return this
	}

	public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return returnStepOrThrow(this.data.step).orderBy(...orderByItems)
	}

	public limit(n: null|number|All): LimitStep {
		return new LimitStep(this.data, this, n)
	}

	public limit$(n: null|number): LimitStep {
		return new LimitStep(this.data, this, n, true)
	}

	public offset(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n)
	}

	public offset$(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n, true)
	}
}
