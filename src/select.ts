import { BuilderOption } from './option'
import { SelectItem } from './steps/steps'
import { Column } from './columns'
import { Expression } from './models'
import { escapeDoubleQuote } from './util'
import { BinderStore } from './binder'

export class SelectItemInfo {
  public set builderOption(option: BuilderOption) {
    this.option = option
  }

  constructor(
    private readonly selectItem: SelectItem,
    public readonly alias?: string,
    private option?: BuilderOption,
  ) {}

  public getColumns(): Column[] {
    if (this.selectItem instanceof Column) {
      return [this.selectItem]
    } else if (this.selectItem instanceof Expression) {
      return this.selectItem.getColumns()
    }
    return []
  }

  public getStmt(data: { binderStore: BinderStore }): string {
    if (this.alias !== undefined) {
      // escape double quote by repeating it
      const escapedAlias = escapeDoubleQuote(this.alias)
      const asString = (this.option?.addAsBeforeColumnAlias === 'always')
        ? ' AS' : ''
      return `${this.selectItem.getStmt(data)}${asString} "${escapedAlias}"`
    }
    return `${this.selectItem.getStmt(data)}`
  }

}
