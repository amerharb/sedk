import { RootStep, UpdateWhereStep } from '@src/steps'
import { database } from '@test/database'
import { builderData } from '@test/unit/steps/builderData'

//Alias
const table1 = database.s.public.t.table1

describe('UpdateConditionStep', () => {
	const rootStep = new RootStep(builderData)
	describe('UpdateWhereStep', () => {
		it(`returns: [WHERE "col7"]`, () => {
			const actual = new UpdateWhereStep(rootStep, [table1.c.col7]).getStepStatement()
			expect(actual).toEqual('WHERE "col7"')
		})
	})
})
