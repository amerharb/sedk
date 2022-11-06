import { FromItem } from './SelectFromStep'
import { Condition } from '../../models'
import { OnStep } from './AfterFromStep'
import { Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'

abstract class BaseJoinStep extends BaseStep {
	protected constructor(
		private readonly joinType: 'JOIN'|'LEFT JOIN'|'RIGHT JOIN'|'INNER JOIN'|'FULL OUTER JOIN',
		prevStep: BaseStep,
		private readonly fromItem: FromItem,
	) {
		super(prevStep)
	}

	public on(condition: Condition): OnStep {
		return new OnStep(this, condition)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `${this.joinType} ${this.fromItem.getStmt(this.data, artifacts)}`
	}

	protected getStepArtifacts(): Artifacts {
		const table = this.fromItem instanceof Table ? this.fromItem : this.fromItem.table
		return { tables: new Set([table]), columns: new Set() }
	}
}

export class JoinStep extends BaseJoinStep {
	public constructor(prevStep: BaseStep, fromItem: FromItem) {
		super('JOIN', prevStep, fromItem)
	}
}

export class LeftJoinStep extends BaseJoinStep {
	public constructor(prevStep: BaseStep, fromItem: FromItem) {
		super('LEFT JOIN', prevStep, fromItem)
	}
}

export class RightJoinStep extends BaseJoinStep {
	public constructor(prevStep: BaseStep, fromItem: FromItem) {
		super('RIGHT JOIN', prevStep, fromItem)
	}
}

export class InnerJoinStep extends BaseJoinStep {
	public constructor(prevStep: BaseStep, fromItem: FromItem) {
		super('INNER JOIN', prevStep, fromItem)
	}
}

export class FullOuterJoinStep extends BaseJoinStep {
	public constructor(prevStep: BaseStep, fromItem: FromItem) {
		super('FULL OUTER JOIN', prevStep, fromItem)
	}
}
