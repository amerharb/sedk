import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { PrimitiveType } from '../models/types'
import { ValuesStep } from './ValuesStep'
import { InsertColumnsAndExpressionsNotEqualError, InsertColumnsAndValuesNotEqualError } from '../errors'
import { Binder } from '../binder'
import { SelectStep } from './stepInterfaces'
import { returnStepOrThrow } from '../util'
import { SelectItemInfo } from '../SelectItemInfo'
import { SelectItem } from './Step'
import { Default } from '../singletoneConstants'

export class IntoStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  public values(...values: (PrimitiveType|Binder|Default)[]): ValuesStep {
    this.throwIfColumnAndValueNotEqual(values)
    this.data.insertIntoValues.push(...values)
    return new ValuesStep(this.data)
  }

  public values$(...values: PrimitiveType[]): ValuesStep {
    this.throwIfColumnAndValueNotEqual(values)
    this.data.insertIntoValues.push(...values.map(it => new Binder(it)))
    return new ValuesStep(this.data)
  }

  public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    this.throwIfColumnAndExpressionsNotEqual(items)
    return returnStepOrThrow(this.data.step).select(...items)
  }

  private throwIfColumnAndValueNotEqual(values: (PrimitiveType|Binder|Default)[]) {
    const columnsCount = this.data.insertIntoColumns.length
    if (columnsCount > 0 && columnsCount !== values.length) {
      throw new InsertColumnsAndValuesNotEqualError(columnsCount, values.length)
    }
  }

  private throwIfColumnAndExpressionsNotEqual(items: (SelectItemInfo|SelectItem|PrimitiveType)[]) {
    const columnsCount = this.data.insertIntoColumns.length
    if (columnsCount > 0 && columnsCount !== items.length) {
      throw new InsertColumnsAndExpressionsNotEqualError(columnsCount, items.length)
    }
  }
}
