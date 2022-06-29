import { Builder } from '../../src'
import { database } from '../database'

//Alias
const table1 = database.s.public.t.table1
const table2 = database.s.public.t.table2

describe('DELETE Path', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })
  describe('basic delete all', () => {
    it('Produces [DELETE FROM "table1"]', () => {
      const actual = sql.deleteFrom(table1).getSQL()

      expect(actual).toEqual('DELETE FROM "table1";')
    })
    it('Produces [DELETE FROM "table2"]', () => {
      const actual = sql.delete().from(table2).getSQL()

      expect(actual).toEqual('DELETE FROM "table2";')
    })
    it('Produces [DELETE FROM "table1" AS "t1"]', () => {
      const actual = sql.delete().from(table1.as('t1')).getSQL()

      expect(actual).toEqual('DELETE FROM "table1" AS "t1";')
    })
    it('Produces [DELETE FROM "table2" AS "t2"]', () => {
      const actual = sql.deleteFrom(table2.as('t2')).getSQL()

      expect(actual).toEqual('DELETE FROM "table2" AS "t2";')
    })
  })
})
