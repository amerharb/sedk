import { FromItemInfo, FromItemRelation } from '../../FromItemInfo'
import { BuilderData } from '../../builder'
import { AliasedTable, BooleanColumn, Column, Table } from '../../database'
import { ItemInfo } from '../../ItemInfo'
import { Condition, PrimitiveType } from '../../models'
import { LogicalOperator } from '../../operators'
import { OrderByArgsElement } from '../../orderBy'
import { ReturningItem } from '../../ReturningItemInfo'
import { All } from '../../singletoneConstants'
import { Parenthesis, SelectWhereStep } from '../../steps'
import { Artifacts, BaseStep } from '../BaseStep'
import { FromItems } from '../step'
import {
	CrossJoinStep,
	GroupByStep,
	IAfterFromSteps
} from '../stepInterfaces'
import {
	FullOuterJoinStep,
	InnerJoinStep,
	JoinStep,
	LeftJoinStep,
	RightJoinStep,
} from './BaseJoinStep'
import { ReturningStep } from '../ReturningStep'
import { OffsetStep } from './OffsetStep'
import { LimitStep } from './LimitStep'
import { OrderByStep } from './OrderByStep'

export class SelectFromStep extends BaseStep implements IAfterFromSteps {
	public constructor(
		data: BuilderData,
		prevStep: BaseStep,
		protected readonly fromItems: FromItems,
	) {
		super(data, prevStep)
		/**
		 *  Add FromItems to FromItemInfos so database object (schema, table, columns) knows the table that included in quote
		 *  TODO: change this to make data more generic, to include all tables in sql not just in FROM clause
		 */
		this.fromItems.forEach(it => {
			this.data.fromItemInfos.push(new FromItemInfo(
				BaseStep.getTable(it),
				FromItemRelation.NO_RELATION, //TODO: to be removed, as relation doesn't matter any more
				it instanceof AliasedTable ? it.alias : undefined,
			))
		})
	}

	getStepStatement(): string {
		let result = 'FROM '
		result += this.fromItems.map(it => it.getStmt(this.data)).join(', ')
		return result
	}

	protected getStepArtifacts(): Artifacts {
		return { tables: new Set(this.fromItems.map(it => it instanceof Table ? it : it.table)), columns: new Set() }
	}

	crossJoin(table: Table): CrossJoinStep {
		throw new Error('Method not implemented.')
	}

	leftJoin(table: Table): LeftJoinStep {
		return new LeftJoinStep(this.data, this, table)
	}

	rightJoin(table: Table): RightJoinStep {
		return new RightJoinStep(this.data, this, table)
	}

	fullOuterJoin(table: Table): FullOuterJoinStep {
		return new FullOuterJoinStep(this.data, this, table)
	}

	innerJoin(table: Table): InnerJoinStep {
		return new InnerJoinStep(this.data, this, table)
	}

	join(table: Table): JoinStep {
		return new JoinStep(this.data, this, table)
	}

	groupBy(...groupByItems: Column[]): GroupByStep {
		throw new Error('Method not implemented.')
	}

	limit(n: number|All|null): LimitStep {
		return new LimitStep(this.data, this, n)
	}

	limit$(n: number|null): LimitStep {
		return new LimitStep(this.data, this, n, true)
	}

	offset(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n)
	}

	offset$(n: number): OffsetStep {
		return new OffsetStep(this.data, this, n, true)
	}

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return new OrderByStep(this.data, this, orderByItems)
	}

	// TODO: check if we can limit this to only update, insert and delete
	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return new ReturningStep(this.data, this, items)
	}

	where(condition: Condition): SelectWhereStep
	where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep
	where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep
	where(condition: Condition, operator?: LogicalOperator, middle?: Condition, operator2?: LogicalOperator, right?: Condition): SelectWhereStep {
		const whereParts: (Condition|LogicalOperator|BooleanColumn|Parenthesis)[] = []
		BaseStep.addConditionParts(whereParts, condition, operator, middle, operator2, right)
		return new SelectWhereStep(this.data, this, whereParts)
	}
}

