import { BuilderOption } from './builder'
import { SelectItem } from './steps'
import { Column } from './schema'
import { Expression } from './models'

export class SelectItemInfo {
  public set builderOption(option: BuilderOption) {
    this.option = option
  }

  constructor(
    private readonly selectItem: SelectItem,
    private readonly alias?: string,
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

  public toString(): string {
    if (this.alias !== undefined) {
      // escape double quote by repeating it
      const escapedAlias = this.alias.replace(/"/g, '""')
      return `${this.selectItem} AS "${escapedAlias}"`
    }
    return `${this.selectItem}`
  }

}
