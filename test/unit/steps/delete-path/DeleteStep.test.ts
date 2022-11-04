import { DeleteStep, RootStep } from 'Non-Exported/steps'
import { builderData } from 'test/unit/steps/builderData'

describe('DeleteStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [DELETE]', () => {
		const actual = new DeleteStep(rootStep).getStepStatement()
		expect(actual).toEqual('DELETE')
	})
})
