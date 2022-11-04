import { IntoStep, RootStep } from 'Non-Exported/steps'
import { database } from 'test/database'
import { builderData } from 'test/unit/steps/builderData'

//Aliases
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col4 = table1.c.col4

describe('IntoStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [INTO "table1"]', () => {
		const actual = new IntoStep(rootStep, table1).getStepStatement()
		expect(actual).toEqual('INTO "table1"')
	})
	it.todo('returns: [INTO "schema1"."table1"]')
	it('returns: [INTO "table1"("col1", "col4")]', () => {
		const actual = new IntoStep(rootStep, table1, [col1, col4]).getStepStatement()
		expect(actual).toEqual('INTO "table1"("col1", "col4")')
	})
})
