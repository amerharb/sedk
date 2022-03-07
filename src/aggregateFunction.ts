import { Expression, ExpressionType } from './models'
import { SelectItemInfo } from './select'

export enum AggregateFunctionEnum {
  SUM = 'SUM',
  AVG = 'AVG',
  COUNT = 'COUNT',
  MAX = 'MAX',
  MIN = 'MIN',
}

export class AggregateFunction {
  constructor(private readonly funcName: AggregateFunctionEnum, private readonly expression: Expression) {
    if (expression.type !== ExpressionType.NUMBER)
      throw new Error('Expression Type must be number in aggregate function')
  }

  public as(alias: string): SelectItemInfo {
    return new SelectItemInfo(this, alias)
  }

  public toString(): string {
    return `${this.funcName}(${this.expression.toString(false)})`
  }
}
