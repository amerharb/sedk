import { Artifacts } from './steps/BaseStep.ts'
import { Column } from './database/index.ts'
import { Expression } from './models/index.ts'
import { escapeDoubleQuote } from './util.ts'
import { BuilderData } from './builder.ts'
import { Binder, BinderStore } from './binder.ts'
import { Asterisk } from './singletoneConstants.ts'
import { ColumnLike } from './steps/index.ts'
import { ItemInfo } from './ItemInfo.ts'
import { TableAsterisk } from './TableAsterisk.ts'

export type ReturningItem = ColumnLike|Binder|Asterisk|TableAsterisk

export class ReturningItemInfo extends ItemInfo {
	constructor(
		private readonly returningItem: ReturningItem,
		public readonly alias?: string,
	) {
		super(alias)
	}

	public getColumns(): Column[] {
		if (this.returningItem instanceof Column) {
			return [this.returningItem]
		} else if (this.returningItem instanceof Expression) {
			return this.returningItem.getColumns()
		}
		return []
	}

	public getStmt(data: BuilderData, artifacts: Artifacts, binderStore: BinderStore): string {
		if (this.alias !== undefined) {
			// escape double quote by repeating it
			const escapedAlias = escapeDoubleQuote(this.alias)
			const asString = (data.option.addAsBeforeColumnAlias === 'always') ? ' AS' : ''
			return `${this.returningItem.getStmt(data, artifacts, binderStore)}${asString} "${escapedAlias}"`
		}
		return `${this.returningItem.getStmt(data, artifacts, binderStore)}`
	}
}
