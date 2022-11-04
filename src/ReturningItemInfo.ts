import { Artifacts } from './steps/BaseStep'
import { Column } from './database'
import { Expression } from './models'
import { escapeDoubleQuote } from './util'
import { BuilderData } from './builder'
import { Binder, BinderStore } from './binder'
import { Asterisk } from './singletoneConstants'
import { ColumnLike } from './steps'
import { ItemInfo } from './ItemInfo'
import { TableAsterisk } from './TableAsterisk'

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
