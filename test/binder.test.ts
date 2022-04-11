import { Builder, $ } from '../src'
import { database } from './database'

//Alias
const table = database.s.public.t.table1

describe('test from one table', () => {
  const sql1 = new Builder(database)
  const sql2 = new Builder(database)
  afterEach(() => {
    sql1.cleanUp()
    sql2.cleanUp()
  })

  it('Produces [SELECT $1 FROM "table1";] 2 binds at the same time', () => {
    const actual1 = sql1
      .select($(1))
      .from(table)
    const actual2 = sql2
      .select($(2))
      .from(table)

    const expected1 = {
      sql: 'SELECT $1 FROM "table1";',
      values: [1],
    }

    const expected2 = {
      sql: 'SELECT $1 FROM "table1";',
      values: [2],
    }

    expect(actual1.getBinds()).toEqual(expected1)
    expect(actual2.getBinds()).toEqual(expected2)
  })
})
