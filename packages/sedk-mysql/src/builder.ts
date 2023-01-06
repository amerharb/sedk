import { Database } from './database'
import { RootStep, } from './steps'
import { BuilderOption, BuilderOptionRequired, fillUndefinedOptionsWithDefault } from './option'

export type BuilderData = {
	database: Database,
	option: BuilderOptionRequired,
}

export function builder(database: Database, option?: BuilderOption): RootStep {
	return new RootStep(getDataObj(database, option))
}

function getDataObj(database: Database, option?: BuilderOption): BuilderData {
	return {
		database: database,
		option: fillUndefinedOptionsWithDefault(option ?? {}),
	}
}
