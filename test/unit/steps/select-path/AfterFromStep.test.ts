import { CrossJoinStep, RootStep } from '@src/steps'
import { builderData } from '@test/unit/steps/builderData'
import { database } from '@test/database'

//Aliases
const table1 = database.s.public.t.table1

describe('AfterFromStep', () => {
	const rootStep = new RootStep(builderData)
	describe('CrossJoinStep', () => {
		it(`returns: [CROSS JOIN "table1" AS "t2"]`, () => {
			const actual = new CrossJoinStep(rootStep, table1.as('t2')).getStepStatement()
			expect(actual).toEqual('CROSS JOIN "table1" AS "t2"')
		})
	})
})
