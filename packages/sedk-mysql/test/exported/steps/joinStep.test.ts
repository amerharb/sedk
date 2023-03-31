import { builder } from 'sedk-mysql'
import { database } from '@test/database'
//Alias
const table1 = database.s.public.t.table1
const table1Col1 = database.s.public.t.table1.c.col1
const table2 = database.s.public.t.table2

describe.skip('Test JOIN Step', () => {
	const sql = builder(database)
	describe('basic join', () => {
		it('Produces [SELECT * FROM "table1" JOIN "table2" ON "table1"."col1" = "table2"."col1";]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				// .join(table2)
				// .on(table1Col1.eq(table2.c.col1))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" JOIN "table2" ON "table1"."col1" = "table2"."col1";')
		})
		it('Produces [SELECT * FROM "table1" JOIN "table2" ON "table1"."col1" = "table2"."col1" AND "table1"."col2" = "table2"."col2";]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				// .join(table2)
				// .on(table1Col1.eq(table2.c.col1))
				// .and(table1.c.col2.eq(table2.c.col2))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" JOIN "table2" ON "table1"."col1" = "table2"."col1" AND "table1"."col2" = "table2"."col2";')
		})
		it('Produces [SELECT * FROM "table1" JOIN "table2" ON "table1"."col1" = "table2"."col1" OR "table1"."col2" = "table2"."col2";]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				// .join(table2)
				// .on(table1Col1.eq(table2.c.col1))
				// .or(table1.c.col2.eq(table2.c.col2))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" JOIN "table2" ON "table1"."col1" = "table2"."col1" OR "table1"."col2" = "table2"."col2";')
		})
	})
})
