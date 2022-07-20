import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { PrimitiveType } from '../models/types'
import { ValuesStep } from './ValuesStep'

export class IntoStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  public values(...values: PrimitiveType[]): ValuesStep {
    // TODO: throw error in number of values does not match number of insertinto array
    this.data.insertIntoValues = values
    return new ValuesStep(this.data)
  }
}
