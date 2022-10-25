import { RootStep } from 'Non-Exported/steps'
import { builderData } from 'test/nonExported/steps/builderData'

describe('RootStep', () => {
	it('getSQL return [;]',()=> {
		expect(new RootStep(builderData).getSQL()).toEqual(';')
	})
	it('getStepStatement return empty string',()=> {
		expect(new RootStep(builderData).getStepStatement()).toEqual('')
	})
})
