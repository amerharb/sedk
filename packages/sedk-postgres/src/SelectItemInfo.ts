import { BinderStore } from './binder.ts'
import { Artifacts } from './steps/BaseStep.ts'
import { SelectItem } from './steps/index.ts'
import { Column } from './database/index.ts'
import { Expression } from './models/index.ts'
import { escapeDoubleQuote } from './util.ts'
import { BuilderData } from './builder.ts'
import { AggregateFunction } from './AggregateFunction.ts'
import { ItemInfo } from './ItemInfo.ts'

export class SelectItemInfo extends ItemInfo {
	constructor(
		public readonly selectItem: SelectItem,
		public readonly alias?: string,
	) {
		super(alias)
	}

	public getColumns(): Column[] {
		if (this.selectItem instanceof Column) {
			return [this.selectItem]
		} else if (this.selectItem instanceof Expression) {
			return this.selectItem.getColumns()
		} else if (this.selectItem instanceof AggregateFunction) {
			return this.selectItem.getColumns()
		} // after this selectItem is always Asterisk or Binder
		return []
	}

	public getStmt(data: BuilderData, artifacts: Artifacts, binderStore: BinderStore): string {
		if (this.alias !== undefined) {
			// escape double quote by repeating it
			const escapedAlias = escapeDoubleQuote(this.alias)
			const asString = (data.option.addAsBeforeColumnAlias === 'always') ? ' AS' : ''
			return `${this.selectItem.getStmt(data, artifacts, binderStore)}${asString} "${escapedAlias}"`
		}
		return `${this.selectItem.getStmt(data, artifacts, binderStore)}`
	}
}
