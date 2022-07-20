import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'

export class IntoStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  // TODO: write code for Values step
  // public values(...values: PrimitiveType[]): ValueStep {
  //   return returnStepOrThrow(this.data.step).returning(...items)
  // }
}
