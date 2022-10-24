import { InvalidOffsetValueError } from 'src'
import { OffsetStep, RootStep } from 'Non-Exported/steps'
import { builderData } from 'test/nonExported/steps/builderData'

describe('OffsetStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [OFFSET 1]', () => {
		const actual = new OffsetStep(builderData, rootStep, 1).getStepStatement()
		expect(actual).toEqual('OFFSET 1')
	})
	/** Postgres accept decimal value */
	it(`returns: [OFFSET 1.7]`, () => {
		const actual = new OffsetStep(builderData, rootStep, 1.7).getStepStatement()
		expect(actual).toEqual(`OFFSET 1.7`)
	})
	it(`returns: [OFFSET $1]`, () => {
		const actual = new OffsetStep(builderData, rootStep, 1, true).getStepStatement()
		expect(actual).toEqual(`OFFSET $1`)
	})
	it(`throws InvalidOffsetValueError`, () => {
		const actual = () => new OffsetStep(builderData, rootStep, -1).getStepStatement()
		expect(actual).toThrow(InvalidOffsetValueError)
		expect(actual).toThrow(`Invalid offset value: -1, value must be positive number`)
	})
})
