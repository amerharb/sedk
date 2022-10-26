import { IntoStep, RootStep } from 'Non-Exported/steps'
import { database } from 'test/database'
import { builderData } from 'test/nonExported/steps/builderData'

//Aliases
const table1 = database.s.public.t.table1

describe('IntoStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [INTO "table1"]', () => {
		const actual = new IntoStep(builderData, rootStep, table1).getStepStatement()
		expect(actual).toEqual('INTO "table1"')
	})
	it.todo('returns: [INTO "schema1"."table1"]')
})
