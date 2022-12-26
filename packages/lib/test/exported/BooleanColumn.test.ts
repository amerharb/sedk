import { database } from '@test/database'

describe('BooleanColumn', () => {
	describe('getColumns()', () => {
		it(`returns array of one item of itself`, () => {
			const actual = database.s.public.t.table1.c.col7.getColumns()
			expect(actual).toEqual([database.s.public.t.table1.c.col7])
		})
	})
})
