import { DeleteFromStep, RootStep } from 'Non-Exported/steps'
import { database } from 'test/database'
import { builderData } from 'test/nonExported/steps/builderData'

//Aliases
const table1 = database.s.public.t.table1

describe('DeleteFromStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [FROM "table1"]', () => {
		const actual = new DeleteFromStep(rootStep, table1).getStepStatement()
		expect(actual).toEqual('FROM "table1"')
	})
	it('returns: [FROM "table1" AS "t1"]', () => {
		const actual = new DeleteFromStep(rootStep, table1.as('t1')).getStepStatement()
		expect(actual).toEqual('FROM "table1" AS "t1"')
	})
})
