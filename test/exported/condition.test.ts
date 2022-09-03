import { Builder } from '../../src'
import { database } from '../database'

//Alias
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col2 = table1.c.col2
const col4 = table1.c.col4
const col5 = table1.c.col5
const col7 = table1.c.col7
const col8 = table1.c.col8

describe('Condition', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })
	describe('Condition from Condition eq/isEq', () => {
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = TRUE;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).eq(true))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = TRUE;')
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col5" & 1) = 0) = TRUE;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col5.bitwiseAnd(1).eq(0).isEq(true))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col5" & 1) = 0) = TRUE;')
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NULL;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).isEq(null))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NULL;')
		})
	})
	describe('Condition from Condition ne/isNe', () => {
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) <> TRUE;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).ne(true))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) <> TRUE;')
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col5" & 1) = 0) <> TRUE;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col5.bitwiseAnd(1).eq(0).isNe(true))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col5" & 1) = 0) <> TRUE;')
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NOT NULL;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).isNe(null))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NOT NULL;')
		})
	})
	describe('Condition from Condition eq$/isEq$', () => {
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).eq$(true))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = $1;')
			expect(actual.getBindValues()).toEqual([true])
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col5" & 1) = 0) = $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col5.bitwiseAnd(1).eq(0).isEq$(true))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col5" & 1) = 0) = $1;')
			expect(actual.getBindValues()).toEqual([true])
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).isEq$(null))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS $1;')
			expect(actual.getBindValues()).toEqual([null])
		})
	})
	describe('Condition from Condition ne$/isNe$', () => {
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) <> $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).ne$(true))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) <> $1;')
			expect(actual.getBindValues()).toEqual([true])
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col5" & 1) = 0) <> $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col5.bitwiseAnd(1).eq(0).isNe$(true))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col5" & 1) = 0) <> $1;')
			expect(actual.getBindValues()).toEqual([true])
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NOT $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).isNe$(null))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NOT $1;')
			expect(actual.getBindValues()).toEqual([null])
		})
	})
	describe('Condition from Condition in/in$', () => {
		describe('Boolean column', () => {
			it(`Produces [SELECT * FROM "table1" WHERE "col7" IN (TRUE);]`, () => {
				const actual = sql
					.selectAsteriskFrom(table1)
					.where(col7.in(true))
					.getSQL()

				expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col7" IN (TRUE);`)
			})
			it(`Produces [SELECT * FROM "table1" WHERE "col7" IN ('tr');]`, () => {
				const actual = sql
					.selectAsteriskFrom(table1)
					.where(col7.in('tr'))
					.getSQL()

				expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col7" IN ('tr');`)
			})
			it(`Produces [SELECT * FROM "table1" WHERE "col7" IN ("col8");]`, () => {
				const actual = sql
					.selectAsteriskFrom(table1)
					.where(col7.in(col8))
					.getSQL()

				expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col7" IN ("col8");`)
			})
			it(`Produces [SELECT * FROM "table1" WHERE "col7" IN ($1);]`, () => {
				const actual = sql
					.selectAsteriskFrom(table1)
					.where(col7.in$(true))

				const expected = {
					sql: `SELECT * FROM "table1" WHERE "col7" IN ($1);`,
					values: [true],
				}
				expect(actual.getSQL()).toEqual(expected.sql)
				expect(actual.getBindValues()).toEqual(expected.values)
			})
		})
		describe('Text column', () => {
			it(`Produces [SELECT * FROM "table1" WHERE "col1" IN ('a', 'b', 'c');]`, () => {
				const actual = sql
					.selectAsteriskFrom(table1)
					.where(col1.in('a', 'b', 'c'))
					.getSQL()

				expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col1" IN ('a', 'b', 'c');`)
			})
			it(`Produces [SELECT * FROM "table1" WHERE "col1" IN ("col2");]`, () => {
				const actual = sql
					.selectAsteriskFrom(table1)
					.where(col1.in(col2))
					.getSQL()

				expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col1" IN ("col2");`)
			})
			it(`Produces [SELECT * FROM "table1" WHERE "col1" IN ($1, $2, $3);]`, () => {
				const actual = sql
					.selectAsteriskFrom(table1)
					.where(col1.in$('a', 'b', 'c'))

				const expected = {
					sql: `SELECT * FROM "table1" WHERE "col1" IN ($1, $2, $3);`,
					values: ['a', 'b', 'c'],
				}
				expect(actual.getSQL()).toEqual(expected.sql)
				expect(actual.getBindValues()).toEqual(expected.values)
			})
		})
	})
})
