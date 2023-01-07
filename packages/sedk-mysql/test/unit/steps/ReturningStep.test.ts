import { ASTERISK } from 'sedk-mysql'
import { ReturningStep, RootStep } from '@src/steps'
import { builderData } from '@test/builderData'

describe('ReturningStep', () => {
	const rootStep = new RootStep(builderData)
	describe('getStepStatement()', () => {
		it('returns: [RETURNING *]', () => {
			expect(new ReturningStep(rootStep, [ASTERISK]).getStepStatement()).toEqual('RETURNING *')
		})
	})
	describe('Errors:', () => {
		it('throw: "RETURNING step items cannot be empty"', () => {
			const actual = () => new ReturningStep(rootStep, [])
			expect(actual).toThrow('RETURNING step items cannot be empty')
		})
	})
})
