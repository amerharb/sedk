import { Artifacts } from './steps/BaseStep'
import { AliasedTable, Column, Database, Table } from './database'
import { PrimitiveType } from './models'
import { BinderStore } from './binder'
import { ASTERISK, All, Distinct } from './singletoneConstants'
import {
	DeleteFromStep,
	DeleteStep,
	FromItems,
	InsertStep,
	IntoStep,
	RootStep,
	SelectFromStep,
	SelectItem,
	SelectStep,
	UpdateStep,
} from './steps'
import { SelectItemInfo } from './SelectItemInfo'
import { BuilderOption, BuilderOptionRequired, fillUndefinedOptionsWithDefault } from './option'
import { MoreThanOneDistinctOrAllError } from './errors'
import { ItemInfo } from './ItemInfo'

export enum SqlPath {
	SELECT = 'SELECT',
	DELETE = 'DELETE',
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
}

export type BuilderData = {
	database: Database,
	option: BuilderOptionRequired,
	/** Below data used to generate SQL statement */
	selectItemInfos: ItemInfo[],
	binderStore: BinderStore,
	// TODO: temp use, evaluate later to keep it here or not
	artifact?: Artifacts,
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
		selectItemInfos: [],
		binderStore: new BinderStore(),
		option: fillUndefinedOptionsWithDefault(option ?? {}),
	}
}
