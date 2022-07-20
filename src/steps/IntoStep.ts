import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { PrimitiveType } from '../models/types'
import { ValuesStep } from './ValuesStep'
import { InsertColumnsAndValuesNotEqualError } from '../errors'

export class IntoStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  public values(...values: PrimitiveType[]): ValuesStep {
    //alias
    const columnsCount = this.data.insertIntoColumns.length
    if (columnsCount > 0 && columnsCount !== values.length) {
      throw new InsertColumnsAndValuesNotEqualError(columnsCount, values.length)
    }
    this.data.insertIntoValues = values
    return new ValuesStep(this.data)
  }
}
