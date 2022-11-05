import { $, LogicalOperator, builder } from 'src'
import { database } from 'test/database'

//Alias
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col2 = table1.c.col2
const col3 = table1.c.col3
const AND = LogicalOperator.AND

describe('Test binder with multi builders', () => {
	const sql = builder(database)
	const sql1 = builder(database)
	const sql2 = builder(database)
	afterEach(() => {
		sql.cleanUp()
		sql1.cleanUp()
		sql2.cleanUp()
	})

	it('Produces [SELECT $1 FROM "table1";] 2 binds at the same time', () => {
		const actual1 = sql1
			.select($(1))
			.from(table1)
		const actual2 = sql2
			.select($(2))
			.from(table1)

		expect(actual1.getSQL()).toEqual('SELECT $1 FROM "table1";')
		expect(actual1.getBindValues()).toEqual([1])
		expect(actual2.getSQL()).toEqual('SELECT $1 FROM "table1";')
		expect(actual2.getBindValues()).toEqual([2])
	})

	it(`Produces [SELECT $1 FROM "table1";]`, () => {
		const actual = sql
			.select($(5))
			.from(table1)

		const expected = {
			sql: `SELECT $1 FROM "table1";`,
			values: [5],
		}
		expect(actual.getSQL()).toEqual(expected.sql)
		expect(actual.getBindValues()).toEqual(expected.values)
	})

	it(`Produces [SELECT $1, $2, $3, $4 FROM "table1";]`, () => {
		const actual = sql
			.select($(null), $(true), $(1), $(`a`))
			.from(table1)

		const expected = {
			sql: `SELECT $1, $2, $3, $4 FROM "table1";`,
			values: [null, true, 1, `a`],
		}
		expect(actual.getSQL()).toEqual(expected.sql)
		expect(actual.getBindValues()).toEqual(expected.values)
	})

	it(`Produces [['a', 'b', 'c']] without calling getSQL first`, () => {
		const select = sql.selectAsteriskFrom(table1)
		const getStmtSelect = jest.spyOn(select, 'getStepStatement')
		const where = select.where(col1.eq$('a'), AND, col2.eq$('b'))
		const getStmtWhere = jest.spyOn(where, 'getStepStatement')
		const and = where.and(col3.eq$('c'))
		const getStmtAnd = jest.spyOn(and, 'getStepStatement')

		const expected = ['a', 'b', 'c']

		expect(and.getBindValues()).toEqual(expected)
		expect(getStmtSelect).toHaveBeenCalledTimes(1)
		expect(getStmtWhere).toHaveBeenCalledTimes(1)
		expect(getStmtAnd).toHaveBeenCalledTimes(1)

		// result the same second time
		expect(and.getBindValues()).toEqual(expected)
		expect(getStmtSelect).toHaveBeenCalledTimes(1)
		expect(getStmtWhere).toHaveBeenCalledTimes(1)
		expect(getStmtAnd).toHaveBeenCalledTimes(1)

		// result the same after calling getSQL
		and.getSQL()
		expect(getStmtSelect).toHaveBeenCalledTimes(2)
		expect(getStmtWhere).toHaveBeenCalledTimes(2)
		expect(getStmtAnd).toHaveBeenCalledTimes(2)

		expect(and.getBindValues()).toEqual(expected)
		expect(getStmtSelect).toHaveBeenCalledTimes(2)
		expect(getStmtWhere).toHaveBeenCalledTimes(2)
		expect(getStmtAnd).toHaveBeenCalledTimes(2)
	})
})
