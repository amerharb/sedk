import { RootStep, SelectStep } from '@src/steps'
import { database } from '@test/database'
import { builderData } from '@test/builderData'

//Aliases
const table1 = database.s.public.t.table1
const col1 = table1.c.col1

describe('SelectStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [SELECT 1]', () => {
		const actual = new SelectStep(rootStep, [1]).getStepStatement()
		expect(actual).toEqual('SELECT 1')
	})

	it(`returns: [SELECT 'A']`, () => {
		const actual = new SelectStep(rootStep, ['A']).getStepStatement()
		expect(actual).toEqual(`SELECT 'A'`)
	})

	it(`returns: [SELECT "col1"]`, () => {
		const actual = new SelectStep(rootStep, [col1]).getStepStatement()
		expect(actual).toEqual(`SELECT "col1"`)
	})
})
