import { BuilderData } from '../../builder'
import { Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'
import { AfterFromStep } from '../select-path/AfterFromStep'
import { FromItem } from '../Step'

export class CrossJoinStep extends AfterFromStep {
	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly fromItem: FromItem,
	) {
		super(data, prevStep)
	}

	public getStepStatement(artifacts?: Artifacts): string {
		return `CROSS JOIN ${this.fromItem.getStmt(this.data)}`
	}

	protected getStepArtifacts(): Artifacts {
		const table = this.fromItem instanceof Table ? this.fromItem : this.fromItem.table
		return { tables: new Set([table]), columns: new Set() }
	}
}
