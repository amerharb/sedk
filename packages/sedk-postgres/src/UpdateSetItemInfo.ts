import { Artifacts } from './steps/BaseStep'
import {
	Expression,
	IStatementGiver,
	Operand,
	PrimitiveType,
} from './models'
import { Column } from './database'
import { BuilderData } from './builder'
import { Binder, BinderStore } from './binder'
import { Default } from './singletoneConstants'

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
