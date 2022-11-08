import { RootStep } from '@src/steps'
import { builderData } from '@test/unit/steps/builderData'

describe('RootStep', () => {
	it('getSQL return [;]',()=> {
		expect(new RootStep(builderData).getSQL()).toEqual(';')
	})
	it('getStepStatement return empty string',()=> {
		expect(new RootStep(builderData).getStepStatement()).toEqual('')
	})
})
