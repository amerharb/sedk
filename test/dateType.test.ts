import { Builder } from '../src'
import { database } from './database'

//Alias
const table = database.s.public.t.table1
const col9 = database.s.public.t.table1.c.col9

describe(`test Date column`, () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })
  const DATE_2022_06_20_EPOCH = Date.UTC(2022,5, 20)
  describe(`date equal Date object`, () => {
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" = '2022-06-20T00:00:00.000Z';]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.eq(new Date(DATE_2022_06_20_EPOCH)))
        .getSQL()

      expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" = '2022-06-20T00:00:00.000Z';`)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" = $1;]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.eq$(new Date(DATE_2022_06_20_EPOCH)))

      const expected = {
        sql: `SELECT "col9" FROM "table1" WHERE "col9" = $1;`,
        values: [new Date(DATE_2022_06_20_EPOCH)],
      }
      expect(actual.getSQL()).toEqual(expected.sql)
      expect(actual.getBindValues()).toEqual(expected.values)
    })
  })
  describe(`date not equal Date object`, () => {
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <> '2022-06-20T00:00:00.000Z';]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.ne(new Date(DATE_2022_06_20_EPOCH)))
        .getSQL()

      expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" <> '2022-06-20T00:00:00.000Z';`)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <> $1;]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.ne$(new Date(DATE_2022_06_20_EPOCH)))

      const expected = {
        sql: `SELECT "col9" FROM "table1" WHERE "col9" <> $1;`,
        values: [new Date(DATE_2022_06_20_EPOCH)],
      }
      expect(actual.getSQL()).toEqual(expected.sql)
      expect(actual.getBindValues()).toEqual(expected.values)
    })
  })
  describe(`when date is null`, () => {
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
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" IS $1;]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.eq$(null))

      const expected = {
        sql: `SELECT "col9" FROM "table1" WHERE "col9" IS $1;`,
        values: [null],
      }
      expect(actual.getSQL()).toEqual(expected.sql)
      expect(actual.getBindValues()).toEqual(expected.values)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" IS NOT $1;]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.ne$(null))

      const expected = {
        sql: `SELECT "col9" FROM "table1" WHERE "col9" IS NOT $1;`,
        values: [null],
      }
      expect(actual.getSQL()).toEqual(expected.sql)
      expect(actual.getBindValues()).toEqual(expected.values)
    })
  })
})
