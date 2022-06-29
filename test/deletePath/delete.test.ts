import { Builder } from '../../src'
import { database } from '../database'

//Alias
const table = database.s.public.t.table1

describe('DELETE Path', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })
  describe('basic delete all', () => {
    it('Produces [DELETE FROM "table1"] One Step', () => {
      const actual = sql.deleteFrom(table).getSQL()

      expect(actual).toEqual('DELETE FROM "table1";')
    })
    it('Produces [DELETE FROM "table1"] Two Steps', () => {
      const actual = sql.delete().from(table).getSQL()

      expect(actual).toEqual('DELETE FROM "table1";')
    })
  })
})
