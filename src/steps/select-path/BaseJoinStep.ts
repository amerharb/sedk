import { Condition } from '../../models'
import { OnStep } from './OnStep'
import { BuilderData } from '../../builder'
import { AliasedTable, Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'

abstract class BaseJoinStep extends BaseStep {
	protected constructor(
		private readonly joinType: 'JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'INNER JOIN' | 'FULL OUTER JOIN',
		data: BuilderData,
		prevStep: BaseStep,
		private readonly table: Table|AliasedTable,
	) {
		super(data, prevStep)
	}

	public on(condition: Condition): OnStep {
		return new OnStep(this.data, this, condition)
	}

	getStepStatement(): string {
		return `${this.joinType} ${this.table.getStmt(this.data)}`
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set([this.table instanceof Table ? this.table : this.table.table]), columns: new Set() }
	}
}

export class JoinStep extends BaseJoinStep {
	public constructor(data: BuilderData, prevStep: BaseStep, table: Table|AliasedTable) {
		super('JOIN', data, prevStep, table)
	}
}

export class LeftJoinStep extends BaseJoinStep {
	public constructor(data: BuilderData, prevStep: BaseStep, table: Table|AliasedTable) {
		super('LEFT JOIN', data, prevStep, table)
	}
}

export class RightJoinStep extends BaseJoinStep {
	public constructor(data: BuilderData, prevStep: BaseStep, table: Table|AliasedTable) {
		super('RIGHT JOIN', data, prevStep, table)
	}
}

export class InnerJoinStep extends BaseJoinStep {
	public constructor(data: BuilderData, prevStep: BaseStep, table: Table|AliasedTable) {
		super('INNER JOIN', data, prevStep, table)
	}
}

export class FullOuterJoinStep extends BaseJoinStep {
	public constructor(data: BuilderData, prevStep: BaseStep, table: Table|AliasedTable) {
		super('FULL OUTER JOIN', data, prevStep, table)
	}
}
