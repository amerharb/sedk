import { RootStep, UpdateStep } from '@src/steps'
import { database } from '@test/database'
import { builderData } from '@test/builderData'

//Aliases
const table1 = database.s.public.t.table1

describe('UpdateStep', () => {
	const rootStep = new RootStep(builderData)
	it('returns: [UPDATE]', () => {
		const actual = new UpdateStep(rootStep, table1).getStepStatement()
		expect(actual).toEqual('UPDATE "table1"')
	})
})
