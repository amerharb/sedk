import { DEFAULT } from 'Non-Exported/singletoneConstants'
import { RootStep, ValuesStep } from 'Non-Exported/steps'
import { builderData } from 'test/unit/steps/builderData'

describe('ValuesStep', () => {
	const rootStep = new RootStep(builderData)
	it(`returns: [VALUES(1, 'A')]`, () => {
		const actual = new ValuesStep(rootStep, [1, 'A']).getStepStatement()
		expect(actual).toEqual(`VALUES(1, 'A')`)
	})
	it(`returns: [VALUES('1979-11-14T01:00:00.000Z', FALSE]`, () => {
		const actual = new ValuesStep(rootStep, [new Date('1979-11-14 02:00:00'), false]).getStepStatement()
		expect(actual).toEqual(`VALUES('1979-11-14T01:00:00.000Z', FALSE)`)
	})
	it(`returns: [VALUES(DEFAULT)]`, () => {
		const actual = new ValuesStep(rootStep, [DEFAULT]).getStepStatement()
		expect(actual).toEqual(`VALUES(DEFAULT)`)
	})
})
