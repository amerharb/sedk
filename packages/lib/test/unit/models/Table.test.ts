import { database } from '@test/database'

describe('Table', () => {
	describe('getColumns()', () => {
		it('returns correct array for table2', () => {
			const table = database.s.public.t.table2
			const columns = [table.c.col1, table.c.col2]
			expect(table.getColumns()).toEqual(columns)
		})
	})
})
