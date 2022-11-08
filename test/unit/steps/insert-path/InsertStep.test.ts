import { InsertStep, RootStep } from '@src/steps'
import { builderData } from '@test/unit/steps/builderData'

describe('InsertStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [INSERT]', () => {
		const actual = new InsertStep(rootStep).getStepStatement()
		expect(actual).toEqual('INSERT')
	})
})
