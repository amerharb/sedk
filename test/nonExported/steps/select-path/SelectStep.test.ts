import { RootStep, SelectStep } from 'Non-Exported/steps'
import { database } from 'test/database'
import { builderData } from 'test/nonExported/steps/builderData'

//Aliases
const table1 = database.s.public.t.table1
const col1 = table1.c.col1

describe('SelectStep', () => {
	const rootStep = new RootStep(builderData)
	it('Select return: [SELECT 1]', () => {
		const actual = new SelectStep(builderData, rootStep, [1]).getSQL()
		expect(actual).toEqual('SELECT 1;')
	})

	it(`Select return: [SELECT 'A']`, () => {
		const actual = new SelectStep(builderData, rootStep, ['A']).getSQL()
		expect(actual).toEqual(`SELECT 'A';`)
	})

	it(`Select return: [SELECT "col1"]`, () => {
		const actual = new SelectStep(builderData, rootStep, [col1]).getSQL()
		expect(actual).toEqual(`SELECT "col1";`)
	})
})
