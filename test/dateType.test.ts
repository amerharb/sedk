import { Builder } from '../src'
import { database } from './database'

//Alias
const table = database.s.public.t.table1
const col9 = database.s.public.t.table1.c.col9

describe(`test Date column`, () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })

  describe(`Where step for Date`, () => {
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" IS NULL;]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.eq(null))
        .getSQL()

      expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" IS NULL;`)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" IS NOT NULL;]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.ne(null))
        .getSQL()

      expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" IS NOT NULL;`)
    })
  })
})
