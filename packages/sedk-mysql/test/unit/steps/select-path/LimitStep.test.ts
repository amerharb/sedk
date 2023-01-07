import { ALL, ASTERISK, InvalidLimitValueError } from 'sedk-mysql'
import { LimitStep, RootStep } from '@src/steps'
import { builderData } from '@test/builderData'

describe('LimitStep', () => {
	const rootStep = new RootStep(builderData)
	describe('getStepStatement()', () => {
		it('returns: [LIMIT 1]', () => {
			const actual = new LimitStep(rootStep, 1).getStepStatement()
			expect(actual).toEqual('LIMIT 1')
		})
		/** Postgres accept decimal value */
		it(`returns: [LIMIT 1.7]`, () => {
			const actual = new LimitStep(rootStep, 1.7).getStepStatement()
			expect(actual).toEqual(`LIMIT 1.7`)
		})
		/** Postgres accept null in limit */
		it(`returns: [LIMIT NULL]`, () => {
			const actual = new LimitStep(rootStep, null).getStepStatement()
			expect(actual).toEqual(`LIMIT NULL`)
		})
		it(`returns: [LIMIT ALL]`, () => {
			const actual = new LimitStep(rootStep, ALL).getStepStatement()
			expect(actual).toEqual(`LIMIT ALL`)
		})
		it(`returns: [LIMIT $1]`, () => {
			const actual = new LimitStep(rootStep, 1, true).getStepStatement()
			expect(actual).toEqual(`LIMIT $1`)
		})
	})
	describe('returning()', () => {
		it(`returns: [RETURNING *]`, () => {
			const actual = new LimitStep(rootStep, 1).returning(ASTERISK).getStepStatement()
			expect(actual).toEqual(`RETURNING *`)
		})
	})
	describe('Errors:', () => {
		it(`throws InvalidOffsetValueError`, () => {
			const actual = () => new LimitStep(rootStep, -1).getStepStatement()
			expect(actual).toThrow(InvalidLimitValueError)
			expect(actual).toThrow(`Invalid limit value: -1, value must be positive number, null or "ALL"`)
		})
		it(`throws "ALL cannot be used as binder"`, () => {
			const actual = () => new LimitStep(rootStep, ALL, true).getStepStatement()
			expect(actual).toThrow(`ALL cannot be used as binder`)
		})
	})
})
