import { Builder } from '../src'
import { database } from './database'
//Alias
const testTable = database.s.public.t.testTable
const col1 = database.s.public.t.testTable.c.col1
const table2 = database.s.public.t.table2
const table2col1 = database.s.public.t.table2.c.col1
const table1 = database.s.schema1.t.table1
const table1col1 = database.s.schema1.t.table1.c.col1

describe('Test From Step', () => {
  describe('Multi Tables comma separated', () => {
    const sql = new Builder(database)
    afterEach(() => { sql.cleanUp() })
    describe('Two Tables', () => {
      it('Produces [SELECT "testTable"."col1", "table2"."col1" FROM "testTable", "table2";]', () => {
        const actual = sql
          .select(col1, table2col1)
          .from(testTable, table2)
          .getSQL()

        expect(actual).toEqual('SELECT "testTable"."col1", "table2"."col1" FROM "testTable", "table2";')
      })
    })
    describe('Three Tables', () => {
      it('Produces [SELECT "testTable"."col1", "table2"."col1", "table1"."col1" FROM "testTable", "table2", "schema1"."table1";]', () => {
        const actual = sql
          .select(col1, table2col1, table1col1)
          .from(testTable, table2, table1)
          .getSQL()

        expect(actual).toEqual('SELECT "testTable"."col1", "table2"."col1", "table1"."col1"'
          + ' FROM "testTable", "table2", "schema1"."table1";')
      })
    })
  })
})
