import * as sedk from '../../../src'
import { database } from '../../database'

//Alias
const table1 = database.s.public.t.table1

describe('INSERT Path', () => {
  const sql = new sedk.Builder(database)
  afterEach(() => { sql.cleanUp() })
  describe('Basic insert all', () => {
    it(`Produces [INSERT INTO "table1" VALUES('A', 1, TRUE);]`, () => {
      const actual = sql.insertInto(table1).values('A', 1, true).getSQL()
      expect(actual).toEqual(`INSERT INTO "table1" VALUES('A', 1, TRUE);`)
    })
    it(`Produces [INSERT INTO "table1" VALUES('B', 2, FALSE);]`, () => {
      const actual = sql.insert().into(table1).values('B', 2, false).getSQL()
      expect(actual).toEqual(`INSERT INTO "table1" VALUES('B', 2, FALSE);`)
    })
  })
})
