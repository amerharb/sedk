import { AfterFromStep } from './AfterFromStep'
import { FromItemInfo, FromItemRelation } from '../../FromItemInfo'
import { BuilderData } from '../../builder'
import { AliasedTable, Table } from '../../database'
import { Artifacts, BaseStep } from '../BaseStep'
import { FromItems } from '../step'

export class SelectFromStep extends AfterFromStep {
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
}

