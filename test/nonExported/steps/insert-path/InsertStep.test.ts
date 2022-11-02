import { InsertStep, RootStep } from 'Non-Exported/steps'
import { builderData } from 'test/nonExported/steps/builderData'

describe('InsertStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [INSERT]', () => {
		const actual = new InsertStep(rootStep).getStepStatement()
		expect(actual).toEqual('INSERT')
	})
})
