import { ASTERISK } from 'sedk-postgres'
import { ReturningStep, RootStep } from 'Non-Exported/steps'
import { builderData } from 'test/unit/steps/builderData'

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
