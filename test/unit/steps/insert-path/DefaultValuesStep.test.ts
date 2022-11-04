import { DefaultValuesStep, RootStep } from 'Non-Exported/steps'
import { builderData } from 'test/unit/steps/builderData'

describe('DefaultValuesStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [DEFAULT VALUES]', () => {
		const actual = new DefaultValuesStep(rootStep).getStepStatement()
		expect(actual).toEqual('DEFAULT VALUES')
	})
})