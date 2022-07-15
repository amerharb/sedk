import { SelectItem } from './steps/Step'
import { Column } from './columns'
import { Expression } from './models/Expression'
import { escapeDoubleQuote } from './util'
import { BuilderData } from './builder'
import { IStatementGiver } from './models/IStatementGiver'
import { AggregateFunction } from './AggregateFunction'

export class SelectItemInfo implements IStatementGiver{
  constructor(
    private readonly selectItem: SelectItem,
    public readonly alias?: string,
  ) {}

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

  public getStmt(data: BuilderData): string {
    if (this.alias !== undefined) {
      // escape double quote by repeating it
      const escapedAlias = escapeDoubleQuote(this.alias)
      const asString = (data.option?.addAsBeforeColumnAlias === 'always')
        ? ' AS' : ''
      return `${this.selectItem.getStmt(data)}${asString} "${escapedAlias}"`
    }
    return `${this.selectItem.getStmt(data)}`
  }
}
