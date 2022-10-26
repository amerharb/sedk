import { RootStep, UpdateWhereStep } from 'Non-Exported/steps'
import { database } from 'test/database'
import { builderData } from 'test/nonExported/steps/builderData'

//Alias
const table1 = database.s.public.t.table1

describe('UpdateConditionStep', () => {
	const rootStep = new RootStep(builderData)
	describe('UpdateWhereStep', () => {
		it.todo(`returns: [???]`)
	})
})
