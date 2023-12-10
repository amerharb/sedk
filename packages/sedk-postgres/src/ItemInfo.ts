import { BinderStore } from './binder.ts'
import { Artifacts } from './steps/BaseStep.ts'
import { Column } from './database/index.ts'
import { BuilderData } from './builder.ts'
import { IStatementGiver } from './models/index.ts'

export abstract class ItemInfo implements IStatementGiver {
	private readonly unique: symbol = Symbol()

	protected constructor(
		public readonly alias?: string,
	) {}

	public abstract getColumns(): Column[]

	public abstract getStmt(data: BuilderData, artifacts: Artifacts, binderStore: BinderStore): string
}
