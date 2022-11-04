import { OrderByStep, RootStep } from 'Non-Exported/steps'
import { database } from 'test/database'
import { builderData } from 'test/nonExported/steps/builderData'

// Aliases
const table1 = database.s.public.t.table1
const table2 = database.s.public.t.table2
const col1 = table1.c.col1

describe('OrderByStep', () => {
	const rootStep = new RootStep(builderData)
	describe('getStepStatement', () => {
		it('returns: [ORDER BY "col1"]', () => {
			const actual = new OrderByStep(rootStep, [col1]).getStepStatement()
			expect(actual).toEqual('ORDER BY "col1"')
		})
		it('returns: [ORDER BY "table1"."col1"]', () => {
			const actual = new OrderByStep(rootStep, [col1])
				.getStepStatement({ tables: new Set([table1, table2]), columns: new Set([col1]) })
			expect(actual).toEqual('ORDER BY "table1"."col1"')
		})
	})
	describe('Errors', () => {
		it(`throws: Can't find select step to look for aliases`, () => {
			const actual = () => new OrderByStep(rootStep, ['column alias'])
			expect(actual).toThrow(`Can't find select step to look for aliases`)
		})
	})
})
