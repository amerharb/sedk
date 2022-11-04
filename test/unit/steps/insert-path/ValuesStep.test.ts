import { RootStep, ValuesStep } from 'Non-Exported/steps'
import { builderData } from 'test/unit/steps/builderData'

describe('ValuesStep', () => {
	const rootStep = new RootStep(builderData)
	it(`returns: [VALUES(1, 'A')]`, () => {
		const actual = new ValuesStep(rootStep, [1, 'A']).getStepStatement()
		expect(actual).toEqual(`VALUES(1, 'A')`)
	})
	it.todo('returns: values with dates')
	it.todo('returns: values DEFAULT')
	it.todo('returns: values select')
})
