import { Builder } from '../src'
import { database } from './database'

//Alias
const table = database.s.public.t.testTable
const column1 = database.s.public.t.testTable.c.column1
const column2 = database.s.public.t.testTable.c.column2
const column3 = database.s.public.t.testTable.c.column3

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

  it('Produces [SELECT "col1", "col2" FROM "testTable" GROUP BY "col1", "col2";]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .groupBy(column1, column2)
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" GROUP BY "col1", "col2";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' GROUP BY "col1";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column2.eq('a'))
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' GROUP BY "col1";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' AND "col3" = \'b\' GROUP BY "col1";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column2.eq('a'))
      .and(column3.eq('b'))
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' AND "col3" = \'b\' GROUP BY "col1";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' OR "col3" = \'b\' GROUP BY "col1";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column2.eq('a'))
      .or(column3.eq('b'))
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' OR "col3" = \'b\' GROUP BY "col1";')
  })
})
