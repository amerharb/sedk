import { ASTERISK } from 'sedk-postgres'
import { DefaultValuesStep, RootStep } from '@src/steps'
import { builderData } from '@test/builderData'

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
