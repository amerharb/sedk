import { GroupByStep, RootStep } from '@src/steps'
import { database } from '@test/database'
import { builderData } from '@test/unit/steps/builderData'

//Aliases
const table1 = database.s.public.t.table1
const col1 = table1.c.col1

describe('GroupByStep', () => {
	const rootStep = new RootStep(builderData)
	describe('getStepStatement()', () => {
		it('returns: [GROUP BY "col1"]', () => {
			const actual = new GroupByStep(rootStep, [col1]).getStepStatement()
			expect(actual).toEqual('GROUP BY "col1"')
		})
	})
	describe('Errors:', () => {
		it('throws: [GroupByStep: groupByItems must not be empty]', () => {
			const actual = () => new GroupByStep(rootStep, [])
			expect(actual).toThrow('GroupByStep: groupByItems must not be empty')
		})
	})
})
