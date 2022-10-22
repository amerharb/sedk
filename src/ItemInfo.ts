import { Column } from './database'
import { BuilderData } from './builder'
import { IStatementGiver } from './models'

export abstract class ItemInfo implements IStatementGiver {
	private readonly unique: symbol = Symbol()

	protected constructor(
		public readonly alias?: string,
	) {}

	public abstract getColumns(): Column[]

	public abstract getStmt(data: BuilderData): string
}
