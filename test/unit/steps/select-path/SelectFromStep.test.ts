import { RootStep, SelectFromStep } from 'Non-Exported/steps'
import { database } from 'test/database'
import { builderData } from 'test/unit/steps/builderData'

//Aliases
const table1 = database.s.public.t.table1
const table2 = database.s.public.t.table2

describe('SelectFromStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [FROM "table1"]', () => {
		const actual = new SelectFromStep(rootStep, [table1]).getStepStatement()
		expect(actual).toEqual('FROM "table1"')
	})
	it('returns: [FROM "table1" AS "t1"]', () => {
		const actual = new SelectFromStep(rootStep, [table1.as('t1')]).getStepStatement()
		expect(actual).toEqual('FROM "table1" AS "t1"')
	})
	it('returns: [FROM "table1", "table2"]', () => {
		const actual = new SelectFromStep(rootStep, [table1, table2]).getStepStatement()
		expect(actual).toEqual('FROM "table1", "table2"')
	})
})
