import * as sedk from '../../../src'
import { database } from '../../database'

//Alias
const table1 = database.s.public.t.table1
const col1 = table1.c.col1

describe('UPDATE Path', () => {
  const sql = new sedk.Builder(database)
  afterEach(() => { sql.cleanUp() })
  describe('Basic update all', () => {
    it(`Produces [UPDATE "table1" SET "col1" = 'A';]`, () => {
      const actual = sql
        .update(table1)
        .set(col1.put('A'))
        .getSQL()
      expect(actual).toEqual(`UPDATE "table1" SET "col1" = 'A';`)
    })
  })
})
