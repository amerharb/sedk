import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { PrimitiveType } from '../models/types'
import { ReturningStep } from './stepInterfaces'
import { ItemInfo } from '../ItemInfo'
import { ReturningItem } from '../ReturningItemInfo'
import { returnStepOrThrow } from '../util'

export class ValuesStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
    return returnStepOrThrow(this.data.step).returning(...items)
  }
}
