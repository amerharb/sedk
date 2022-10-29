import { ItemInfo } from '../../ItemInfo'
import { PrimitiveType } from '../..//models'
import { ReturningItem } from '../../ReturningItemInfo'
import { All } from '../../singletoneConstants'
import { BaseStep } from '../BaseStep'
import { LimitStep } from './LimitStep'
import { OffsetStep } from './OffsetStep'
import { ReturningStep } from '../ReturningStep'

export abstract class OrderByStep extends BaseStep {
	public limit(n: null|number|All): LimitStep {
		return new LimitStep(this.data, this, n)
	}

	public limit$(n: null|number): LimitStep {
		return new LimitStep(this.data, this, n, true)
	}

	public offset(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n)
	}

	public offset$(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n, true)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this.data, this, items)
	}
}
