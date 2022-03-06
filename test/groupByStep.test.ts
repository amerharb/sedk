import { Builder } from '../src'
import { database } from './database'

//Alias
const table = database.s.public.t.testTable
const column1 = database.s.public.t.testTable.c.column1

describe('test groupBy Step', () => {
  const sql = new Builder(database)

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1";')
  })
})
