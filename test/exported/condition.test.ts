import { Builder } from '../../src'
import { database } from '../database'

//Alias
const table1 = database.s.public.t.table1
const col4 = table1.c.col4

describe('Condition', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })
  describe('Condition from Condition', () => {
    it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = TRUE;]', () => {
      const actual = sql
        .selectAsteriskFrom(table1)
        .where(col4.bitwiseAnd(1).eq(0).eq(true))
        .getSQL()
      expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = TRUE;')
    })
    it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = TRUE;]', () => {
      const actual = sql
        .selectAsteriskFrom(table1)
        .where(col4.bitwiseAnd(1).eq(0).isEq(true))
        .getSQL()
      expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = TRUE;')
    })
    it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NULL;]', () => {
      const actual = sql
        .selectAsteriskFrom(table1)
        .where(col4.bitwiseAnd(1).eq(0).isEq(null))
        .getSQL()
      expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NULL;')
    })
  })
})