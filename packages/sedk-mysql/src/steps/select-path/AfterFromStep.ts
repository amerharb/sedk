import { FromItem } from './SelectFromStep'
import { Artifacts, BaseStep } from '../BaseStep'
import { Table } from '../../database'
import { Condition } from '../../models'

export abstract class AfterFromStep extends BaseStep {
	public crossJoin(fromItem: FromItem): CrossJoinStep {
		return new CrossJoinStep(this, fromItem)
	}
}

export class CrossJoinStep extends AfterFromStep {
	constructor(
		prevStep: BaseStep,
		private readonly fromItem: FromItem,
	) {
		super(prevStep)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `CROSS JOIN ${this.fromItem.getStmt(this.data, artifacts)}`
	}

	getStepArtifacts(): Artifacts {
		const table = this.fromItem instanceof Table ? this.fromItem : this.fromItem.table
		return { tables: new Set([table]), columns: new Set() }
	}
}

export class OnStep extends AfterFromStep {
	constructor(
		prevStep: BaseStep,
		protected readonly condition: Condition,
	) {
		super(prevStep)
	}

	getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `ON ${this.condition.getStmt(this.data, artifacts, this.binderStore)}`
	}

	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set(this.condition.getColumns()) }
	}

	public or(condition: Condition): OnOrStep {
		return new OnOrStep(this, condition)
	}

	public and(condition: Condition): OnAndStep {
		return new OnAndStep(this, condition)
	}
}

export class OnAndStep extends OnStep {
	override getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `AND ${this.condition.getStmt(this.data, artifacts, this.binderStore)}`
	}
}

export class OnOrStep extends OnStep {
	override getStepStatement(artifacts: Artifacts = { tables: new Set(), columns: new Set() }): string {
		return `OR ${this.condition.getStmt(this.data, artifacts, this.binderStore)}`
	}
}
