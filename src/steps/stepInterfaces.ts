import { AggregateFunction } from '../AggregateFunction'
import { Binder } from '../binder'
import { BuilderData } from '../builder'
import { TableAsterisk } from '../TableAsterisk'
import { BaseStep } from './BaseStep'
import { SelectItemInfo } from '../SelectItemInfo'
import { Column, Table } from '../database'
import { Condition, Expression, PrimitiveType } from '../models'
import { OnStep } from './OnStep'
import { SelectWhereStep } from './SelectWhereStep'
import { DeleteStep } from './DeleteStep'
import { OrderByArgsElement } from '../orderBy'
import { All, Asterisk } from '../singletoneConstants'
import { HavingStep } from './HavingStep'
import { FromItems, SelectItem, Step } from './Step'
import { LogicalOperator } from '../operators'
import { InsertStep } from './InsertStep'
import { ItemInfo } from '../ItemInfo'
import { ReturningItem } from '../ReturningItemInfo'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'
import { SetStep } from './SetStep'

// TODO: move it to separate file
export class RootStep extends BaseStep {
	constructor(data: BuilderData) {
		super(data, null)

	}

	public getStepStatement(): string {
		return ''
	}

	select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new SelectStep(this.data, this, items)
	}

	selectDistinct(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new Step(this.data, this).selectDistinct(...items)
	}

	selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return new Step(this.data, this).selectAll(...items)
	}

	delete(): DeleteStep {
		return new Step(this.data, this).delete()
	}

	insert(): InsertStep {
		return new Step(this.data, this).insert()
	}

	update(table: Table): UpdateStep {
		return new Step(this.data, this).update(table)
	}
}

//TODO: seperate file
export class SelectStep extends BaseStep {

	constructor(
		data: BuilderData,
		prevStep: BaseStep,
		private readonly items: (SelectItemInfo|SelectItem|PrimitiveType)[]) {
		super(data, prevStep)
	}

	from(...tables: FromItems): SelectFromStep {
		return new Step(this.data, this).from(...tables)
	}

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new Step(this.data, this).returning(...items)
	}

	getStepStatement(): string {
		const selectItemInfos: SelectItemInfo[] = this.items.map(it => {
			if (it instanceof SelectItemInfo) {
				return it
			} else if (it instanceof Expression || it instanceof Column || it instanceof AggregateFunction || it instanceof Asterisk || it instanceof TableAsterisk) {
				return new SelectItemInfo(it, undefined)
			} else if (it instanceof Binder) {
				if (it.no === undefined) {
					this.data.binderStore.add(it)
				}
				return new SelectItemInfo(it, undefined)
			} else {
				return new SelectItemInfo(new Expression(it), undefined)
			}
		})
		// this.throwIfColumnsNotInDb(selectItemInfos)
		this.data.selectItemInfos.push(...selectItemInfos)

		let result = `SELECT`

		if (this.data.distinct) {
			result += ` ${this.data.distinct}`
		}

		if (this.data.selectItemInfos.length > 0) {
			const selectPartsString = this.data.selectItemInfos.map(it => {
				return it.getStmt(this.data)
			})
			result += ` ${selectPartsString.join(', ')}`
		}

		return result
	}
}

export interface IAfterFromSteps extends BaseStep, OrderByStep {
	crossJoin(table: Table): CrossJoinStep

	join(table: Table): JoinStep

	leftJoin(table: Table): LeftJoinStep

	rightJoin(table: Table): RightJoinStep

	innerJoin(table: Table): InnerJoinStep

	fullOuterJoin(table: Table): FullOuterJoinStep

	where(condition: Condition): SelectWhereStep

	where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep

	where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep

	groupBy(...groupByItems: Column[]): GroupByStep

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep
}

export interface SelectFromStep extends BaseStep, IAfterFromSteps {}

export interface CrossJoinStep extends BaseStep, IAfterFromSteps {}

interface IJoinStep extends BaseStep {
	on(condition: Condition): OnStep
}

export interface JoinStep extends IJoinStep {}

export interface LeftJoinStep extends IJoinStep {}

export interface RightJoinStep extends IJoinStep {}

export interface InnerJoinStep extends IJoinStep {}

export interface FullOuterJoinStep extends IJoinStep {}

export interface OnOrStep extends OnStep {}

export interface OnAndStep extends OnStep {}

export interface SelectWhereOrStep extends SelectWhereStep {}

export interface SelectWhereAndStep extends SelectWhereStep {}

export interface GroupByStep extends BaseStep, OrderByStep {
	having(condition: Condition): HavingStep

	having(left: Condition, operator: LogicalOperator, right: Condition): HavingStep

	having(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): HavingStep

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
}

export interface HavingOrStep extends HavingStep {}

export interface HavingAndStep extends HavingStep {}

export interface OrderByStep extends BaseStep, LimitStep {
	limit(n: null|number|All): LimitStep

	limit$(n: null|number): LimitStep
}

export interface LimitStep extends BaseStep, OffsetStep {
	offset(n: number): OffsetStep

	offset$(n: number): OffsetStep
}

export interface OffsetStep extends BaseStep {
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep
}

export interface ReturningStep extends BaseStep {}

export interface ValuesStep extends BaseStep {
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep
}

export interface DefaultValuesStep extends BaseStep {
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep
}

export interface UpdateStep extends BaseStep {
	set(...items: UpdateSetItemInfo[]): SetStep
}
