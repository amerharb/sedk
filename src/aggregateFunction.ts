import { NumberLike } from './models'

export enum AggregateFunctionEnum {
  SUM = 'SUM',
  AVG = 'AVG',
  COUNT = 'COUNT',
  MAX = 'MAX',
  MIN = 'MIN',
}

export class AggregateFunction {
  constructor(public readonly funcName: AggregateFunctionEnum, public readonly param: NumberLike) {}

  public toString(): string {
    return `${this.funcName}(${this.param})`
  }
}
