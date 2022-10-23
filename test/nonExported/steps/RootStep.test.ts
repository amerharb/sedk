import { RootStep } from 'Non-Exported/steps'
import { builderData } from 'test/nonExported/steps/builderData'

describe('RootStep', () => {
	it('Root return empty string',()=> {
		expect(new RootStep(builderData).getSQL()).toEqual(';')
	})
})
