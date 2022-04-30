import { Builder, $ } from '../src'
import { database } from './database'

//Alias
const table = database.s.public.t.table1

describe('Test binder with multi builders', () => {
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

    expect(actual1.getSQL()).toEqual('SELECT $1 FROM "table1";')
    expect(actual1.getBindValues()).toEqual([1])
    expect(actual2.getSQL()).toEqual('SELECT $1 FROM "table1";')
    expect(actual2.getBindValues()).toEqual([2])
  })
})
