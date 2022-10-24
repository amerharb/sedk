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
import { BaseStep } from '../BaseStep'
import { FromItems } from '../step'
import {
	CrossJoinStep,
	FullOuterJoinStep,
	GroupByStep,
	IAfterFromSteps,
	InnerJoinStep,
	JoinStep,
	LeftJoinStep,
	LimitStep,
	OffsetStep,
	OrderByStep,
	ReturningStep,
	RightJoinStep,
} from '../stepInterfaces'

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

	protected getStepStatement(): string {
		let result = 'FROM '
		result += this.fromItems.map(it => it.getStmt(this.data)).join(', ')
		return result
	}

	crossJoin(table: Table): CrossJoinStep {
		throw new Error('Method not implemented.')
	}

	fullOuterJoin(table: Table): FullOuterJoinStep {
		throw new Error('Method not implemented.')
	}

	groupBy(...groupByItems: Column[]): GroupByStep {
		throw new Error('Method not implemented.')
	}

	innerJoin(table: Table): InnerJoinStep {
		throw new Error('Method not implemented.')
	}

	join(table: Table): JoinStep {
		throw new Error('Method not implemented.')
	}

	leftJoin(table: Table): LeftJoinStep {
		throw new Error('Method not implemented.')
	}

	limit(n: number|All|null): LimitStep {
		throw new Error('Method not implemented.')
	}

	limit$(n: number|null): LimitStep {
		throw new Error('Method not implemented.')
	}

	offset(n: number): OffsetStep {
		throw new Error('Method not implemented.')
	}

	offset$(n: number): OffsetStep {
		throw new Error('Method not implemented.')
	}

	orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		throw new Error('Method not implemented.')
	}

	returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		throw new Error('Method not implemented.')
	}

	rightJoin(table: Table): RightJoinStep {
		throw new Error('Method not implemented.')
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

