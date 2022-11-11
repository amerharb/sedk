import { DeleteStep, RootStep } from '@src/steps'
import { builderData } from '@test/builderData'

describe('DeleteStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [DELETE]', () => {
		const actual = new DeleteStep(rootStep).getStepStatement()
		expect(actual).toEqual('DELETE')
	})
})
