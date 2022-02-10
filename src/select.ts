import { BuilderOption } from './builder'
import { SelectItem } from './steps'

export class SelectItemInfo {
  public set builderOption(option: BuilderOption) {
    this.option = option
  }

  constructor(
    private readonly selectItem: SelectItem,
    private readonly alias?: string,
    private option?: BuilderOption,
  ) {}

  public toString(): string {
    if (this.alias !== undefined) {
      return `${this.selectItem} AS ${this.alias}`
    }
    return `${this.selectItem}`
  }

}
