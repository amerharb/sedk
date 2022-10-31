import { Column } from 'Non-Exported/database'
import { OrderByArgsElement } from 'Non-Exported/orderBy'
import { BuilderData } from '../../builder'
import { ItemInfo } from '../../ItemInfo'
import { Expression, PrimitiveType } from '../..//models'
import { ReturningItem } from '../../ReturningItemInfo'
import { All } from '../../singletoneConstants'
import { Artifacts, BaseStep } from '../BaseStep'
import { LimitStep } from './LimitStep'
import { OffsetStep } from './OffsetStep'
import { ReturningStep } from '../ReturningStep'

export class OrderByStep extends BaseStep {
	public constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly orderByArgsElement: OrderByArgsElement[],
	) {
		super(data, prevStep)
	}

	protected getStepArtifacts(): Artifacts {
		const columns = this.orderByArgsElement
			.map(it => {
				if (it instanceof Column) {
					return it
				} else if (it instanceof Expression) {
					return it.getColumns()
				} else {
					return []
				}
			})
			.flat(1)
		return { tables: new Set(), columns: new Set(columns) }
	}

	getStepStatement(artifacts: Artifacts): string {
		// TODO: write correct logic
		return 'ORDER BY'
	}

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
