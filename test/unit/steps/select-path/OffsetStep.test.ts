import { ASTERISK, InvalidOffsetValueError } from 'sedk-postgres'
import { OffsetStep, RootStep } from '@src/steps'
import { builderData } from '@test/unit/steps/builderData'

describe('OffsetStep', () => {
	const rootStep = new RootStep(builderData)
	describe('getStepStatement()', () => {
		it('returns: [OFFSET 1]', () => {
			const actual = new OffsetStep(rootStep, 1).getStepStatement()
			expect(actual).toEqual('OFFSET 1')
		})
		/** Postgres accept decimal value */
		it(`returns: [OFFSET 1.7]`, () => {
			const actual = new OffsetStep(rootStep, 1.7).getStepStatement()
			expect(actual).toEqual(`OFFSET 1.7`)
		})
		it(`returns: [OFFSET $1]`, () => {
			const actual = new OffsetStep(rootStep, 1, true).getStepStatement()
			expect(actual).toEqual(`OFFSET $1`)
		})
		it(`throws InvalidOffsetValueError`, () => {
			const actual = () => new OffsetStep(rootStep, -1).getStepStatement()
			expect(actual).toThrow(InvalidOffsetValueError)
			expect(actual).toThrow(`Invalid offset value: -1, value must be positive number`)
		})
	})
	describe('returning()', () => {
		it(`returns: [RETURNING *]`, () => {
			const actual = new OffsetStep(rootStep, 1).returning(ASTERISK).getStepStatement()
			expect(actual).toEqual(`RETURNING *`)
		})
	})
})
