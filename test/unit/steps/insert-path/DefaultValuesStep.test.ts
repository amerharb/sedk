import { ASTERISK } from 'Non-Exported/singletoneConstants'
import { DefaultValuesStep, RootStep } from 'Non-Exported/steps'
import { builderData } from 'test/unit/steps/builderData'

describe('DefaultValuesStep', () => {
	const rootStep = new RootStep(builderData)
	describe('getStepStatement()', () => {
		it('returns: [DEFAULT VALUES]', () => {
			const actual = new DefaultValuesStep(rootStep).getStepStatement()
			expect(actual).toEqual('DEFAULT VALUES')
		})
	})
	describe('returning()', () => {
		it('returns: [RETURNING *]', () => {
			const actual = new DefaultValuesStep(rootStep).returning(ASTERISK)
			expect(actual.getStepStatement()).toEqual('RETURNING *')
		})
	})
})
