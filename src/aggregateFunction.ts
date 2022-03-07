import { NumberLike } from './models'
import { SelectItemInfo } from './select'

export enum AggregateFunctionEnum {
  SUM = 'SUM',
  AVG = 'AVG',
  COUNT = 'COUNT',
  MAX = 'MAX',
  MIN = 'MIN',
}

export class AggregateFunction {
  constructor(private readonly funcName: AggregateFunctionEnum, private readonly numberLike: NumberLike) {}

  public as(alias: string): SelectItemInfo {
    return new SelectItemInfo(this, alias)
  }

  public toString(): string {
    return `${this.funcName}(${this.numberLike})`
  }
}
