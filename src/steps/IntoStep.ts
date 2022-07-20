import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { PrimitiveType } from '../models/types'
import { ValuesStep } from './ValuesStep'
import { InsertColumnsAndValuesNotEqualError } from '../errors'
import { Binder } from '../binder'

export class IntoStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  public values(...values: (PrimitiveType|Binder)[]): ValuesStep {
    this.throwIfColumnAndValueNotEqual(values)
    this.data.insertIntoValues.push(...values)
    return new ValuesStep(this.data)
  }

  public values$(...values: PrimitiveType[]): ValuesStep {
    this.throwIfColumnAndValueNotEqual(values)
    this.data.insertIntoValues.push(...values.map(it => new Binder(it)))
    return new ValuesStep(this.data)
  }

  private throwIfColumnAndValueNotEqual(values: (PrimitiveType|Binder)[]) {
    const columnsCount = this.data.insertIntoColumns.length
    if (columnsCount > 0 && columnsCount !== values.length) {
      throw new InsertColumnsAndValuesNotEqualError(columnsCount, values.length)
    }
  }
}
