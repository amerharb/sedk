import { DEFAULT } from '@src/singletoneConstants'
import { IntoColumnsStep, RootStep, ValuesStep } from '@src/steps'
import { builderData } from '@test/builderData'
import { database } from '@test/database'

// Aliases
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col4 = table1.c.col4
const col7 = table1.c.col7
const col9 = table1.c.col9
describe('ValuesStep', () => {
	const rootStep = new RootStep(builderData)
	it(`returns: [VALUES(1, 'A')]`, () => {
		const intoStep = new IntoColumnsStep(rootStep, [col4, col1])
		const actual = new ValuesStep(intoStep, [1, 'A']).getStepStatement()
		expect(actual).toEqual(`VALUES(1, 'A')`)
	})
	it(`returns: [VALUES('1979-11-14T02:00:00.000Z', FALSE]`, () => {
		const intoStep = new IntoColumnsStep(rootStep, [col9, col7])
		const actual = new ValuesStep(intoStep, [new Date('1979-11-14 02:00:00Z'), false]).getStepStatement()
		expect(actual).toEqual(`VALUES('1979-11-14T02:00:00.000Z', FALSE)`)
	})
	it(`returns: [VALUES(DEFAULT)]`, () => {
		const intoStep = new IntoColumnsStep(rootStep, [col1])
		const actual = new ValuesStep(intoStep, [DEFAULT]).getStepStatement()
		expect(actual).toEqual(`VALUES(DEFAULT)`)
	})
	it(`throws: "Invalid previous step"`, () => {
		// @ts-ignore
		const actual = () => new ValuesStep(rootStep, [DEFAULT]).getStepStatement()
		expect(actual).toThrow('Invalid previous step')
	})
})
