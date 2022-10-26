import { RootStep, UpdateStep } from 'Non-Exported/steps'
import { database } from 'test/database'
import { builderData } from 'test/nonExported/steps/builderData'

//Aliases
const table1 = database.s.public.t.table1

describe('UpdateStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [UPDATE]', () => {
		const actual = new UpdateStep(builderData, rootStep, table1).getStepStatement()
		expect(actual).toEqual('UPDATE "table1"')
	})
})
