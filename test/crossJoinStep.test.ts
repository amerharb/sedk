import { Builder } from '../src'
import { database } from './database'
//Alias
const testTable = database.s.public.t.testTable
const col1 = database.s.public.t.testTable.c.col1
const col2 = database.s.public.t.testTable.c.col2
const table2 = database.s.public.t.table2

describe('Test CROSS JOIN Step', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })
  describe('Diffreant steps after cross join', () => {
    it('Produces [SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" WHERE "testTable"."col1" = \'a\';;]', () => {
      const actual = sql
        .select(col1)
        .from(testTable)
        .crossJoin(table2)
        .where(col1.eq('a'))
        .getSQL()

      expect(actual).toEqual('SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" WHERE "testTable"."col1" = \'a\';')
    })

    it('Produces [SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" GROUP BY "testTable"."col2";]', () => {
      const actual = sql
        .select(col1)
        .from(testTable)
        .crossJoin(table2)
        .groupBy(col2)
        .getSQL()

      expect(actual).toEqual('SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" GROUP BY "testTable"."col2";')
    })

    it('Produces [SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" ORDER BY "testTable"."col2";]', () => {
      const actual = sql
        .select(col1)
        .from(testTable)
        .crossJoin(table2)
        .orderBy(col2)
        .getSQL()

      expect(actual).toEqual('SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" ORDER BY "testTable"."col2";')
    })

    it('Produces [SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" LIMIT 10;]', () => {
      const actual = sql
        .select(col1)
        .from(testTable)
        .crossJoin(table2)
        .limit(10)
        .getSQL()

      expect(actual).toEqual('SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" LIMIT 10;')
    })

    it('Produces [SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" OFFSET 20;]', () => {
      const actual = sql
        .select(col1)
        .from(testTable)
        .crossJoin(table2)
        .offset(20)
        .getSQL()

      expect(actual).toEqual('SELECT "testTable"."col1" FROM "testTable" CROSS JOIN "table2" OFFSET 20;')
    })

  })
})
