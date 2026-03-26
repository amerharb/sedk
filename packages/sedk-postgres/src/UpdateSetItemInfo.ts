import { Artifacts } from './steps/BaseStep.ts'
import {
	Expression,
	IStatementGiver,
	Operand,
	PrimitiveType,
} from './models/index.ts'
import { Column } from './database/index.ts'
import { BuilderData } from './builder.ts'
import { Binder, BinderStore } from './binder.ts'
import { Default } from './singletoneConstants.ts'

export class UpdateSetItemInfo implements IStatementGiver {
	public readonly operand: Operand|Default

	constructor(
		public readonly column: Column,
		value: PrimitiveType|Binder|Expression|Default,
	) {
		if (value instanceof Default) {
			this.operand = value
		} else {
			this.operand = new Operand(value)
		}
	}

	public getStmt(data: BuilderData, artifacts: Artifacts, binderStore: BinderStore): string {
		return `${this.column.getStmt(data, artifacts)} = ${this.operand.getStmt(data, artifacts, binderStore)}`
	}
}
