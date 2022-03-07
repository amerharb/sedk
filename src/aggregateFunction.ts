import { NumberLike } from './models'

export enum AggregateFunctionEnum {
  SUM = 'SUM',
  AVG = 'AVG',
  COUNT = 'COUNT',
  MAX = 'MAX',
  MIN = 'MIN',
}

export class AggregateFunction {
  constructor(private readonly funcName: AggregateFunctionEnum, private readonly numberLike: NumberLike) {}

  public toString(): string {
    return `${this.funcName}(${this.numberLike})`
  }
}
