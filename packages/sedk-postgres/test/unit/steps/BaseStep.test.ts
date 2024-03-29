import { BaseStep, RootStep } from '@src/steps'
import { builderData } from '@test/builderData'

describe('BaseStep', () => {
	const rootStep = new RootStep(builderData)
	describe('cleanUp()', () => {
		it('do nothing', () => {
			// @ts-ignore - create instance of abstract class just for test
			const baseStep = new BaseStep(rootStep)
			expect(baseStep.cleanUp()).toBeUndefined()
			expect(baseStep.cleanUp).not.toThrow()
		})
	})
})
