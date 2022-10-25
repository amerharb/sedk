import { AliasedTable, BooleanColumn, Column, Database, Table } from './database'
import { Condition, PrimitiveType } from './models'
import { Binder, BinderStore } from './binder'
import { ASTERISK, All, Default, Distinct } from './singletoneConstants'
import {
	DeleteFromStep,
	DeleteStep,
	FromItems,
	InsertStep,
	IntoStep,
	Parenthesis,
	RootStep,
	SelectFromStep,
	SelectItem,
	SelectStep,
	Step,
	UpdateStep,
} from './steps'
import { LogicalOperator } from './operators'
import { OrderByItemInfo } from './orderBy'
import { SelectItemInfo } from './SelectItemInfo'
import { BuilderOption, BuilderOptionRequired, fillUndefinedOptionsWithDefault } from './option'
import { MoreThanOneDistinctOrAllError } from './errors'
import { FromItemInfo } from './FromItemInfo'
import { ItemInfo } from './ItemInfo'
import { UpdateSetItemInfo } from './UpdateSetItemInfo'

export enum SqlPath {
	SELECT = 'SELECT',
	DELETE = 'DELETE',
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
}

export type BuilderData = {
	step?: Step,
	database: Database,
	option: BuilderOptionRequired,
	/** Below data used to generate SQL statement */
	sqlPath?: SqlPath
	selectItemInfos: ItemInfo[],
	fromItemInfos: FromItemInfo[],
	groupByItems: Column[],
	havingParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
	orderByItemInfos: OrderByItemInfo[],
	insertIntoTable?: Table
	insertIntoColumns: Column[],
	insertIntoValues: (PrimitiveType|Binder|Default)[],
	insertIntoDefaultValues: boolean,
	updateTable?: Table,
	updateSetItemInfos: UpdateSetItemInfo[],
	binderStore: BinderStore,
}

/**
 * @deprecated - use builder() function instead
 */
export class Builder {
	private readonly data: BuilderData
	private rootStep: RootStep

	constructor(database: Database, option?: BuilderOption) {
		this.data = getDataObj(database, option)
		this.rootStep = new RootStep(this.data)
	}

	public select(distinct: Distinct|All, ...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
	public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
	public select(...items: (Distinct|All|ItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		if (items[0] instanceof Distinct) {
			if (items.length <= 1) throw new Error('Select step must have at least one parameter after DISTINCT')
			items.shift() //remove first item the DISTINCT item
			Builder.throwIfMoreThanOneDistinctOrAll(items)
			const newItems = items as (SelectItemInfo|SelectItem|PrimitiveType)[]
			return this.rootStep.selectDistinct(...newItems)
		}

		if (items[0] instanceof All) {
			items.shift() //remove first item the ALL item
			Builder.throwIfMoreThanOneDistinctOrAll(items)
			const newItems = items as (SelectItemInfo|SelectItem|PrimitiveType)[]
			return this.rootStep.selectAll(...newItems)
		}

		Builder.throwIfMoreThanOneDistinctOrAll(items)
		const newItems = items as (SelectItemInfo|SelectItem|PrimitiveType)[]
		return this.rootStep.select(...newItems)
	}

	public selectDistinct(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return this.rootStep.selectDistinct(...items)
	}

	public selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		return this.rootStep.selectAll(...items)
	}

	public selectAsteriskFrom(...tables: FromItems): SelectFromStep {
		return this.rootStep.select(ASTERISK).from(...tables)
	}

	public delete(): DeleteStep {
		return this.rootStep.delete()
	}

	public deleteFrom(table: Table|AliasedTable): DeleteFromStep {
		return this.rootStep.delete().from(table)
	}

	public insert(): InsertStep {
		return this.rootStep.insert()
	}

	public insertInto(table: Table, ...columns: Column[]): IntoStep {
		return this.rootStep.insert().into(table, ...columns)
	}

	public update(table: Table): UpdateStep {
		return this.rootStep.update(table)
	}

	public cleanUp(): Builder {
		this.rootStep.cleanUp()
		return this
	}

	private static throwIfMoreThanOneDistinctOrAll(items: (Distinct|All|ItemInfo|SelectItem|PrimitiveType)[]) {
		items.forEach(it => {
			if (it instanceof Distinct || it instanceof All)
				throw new MoreThanOneDistinctOrAllError('You can not have more than one DISTINCT or ALL')
		})
	}
}

export function builder(database: Database, option?: BuilderOption): RootStep {
	return new RootStep(getDataObj(database, option))
}

function getDataObj(database: Database, option?: BuilderOption): BuilderData {
	return {
		database: database,
		fromItemInfos: [],
		sqlPath: undefined,
		selectItemInfos: [],
		groupByItems: [],
		havingParts: [],
		orderByItemInfos: [],
		insertIntoTable: undefined,
		insertIntoColumns: [],
		insertIntoValues: [],
		insertIntoDefaultValues: false,
		updateTable: undefined,
		updateSetItemInfos: [],
		binderStore: new BinderStore(),
		option: fillUndefinedOptionsWithDefault(option ?? {}),
	}
}
