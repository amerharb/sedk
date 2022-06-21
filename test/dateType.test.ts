import { Builder } from '../src'
import { database } from './database'

//Alias
const table = database.s.public.t.table1
const col9 = database.s.public.t.table1.c.col9
const col10 = database.s.public.t.table1.c.col10

describe(`test Date column`, () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })
  const EPOCH_2022_06_20 = Date.UTC(2022,5, 20)
  describe(`Equal operator`, () => {
    it(`Produces [SELECT * FROM "table1" WHERE "col9" = "col10";]`, () => {
      const actual = sql
        .selectAsteriskFrom(table)
        .where(col9.eq(col10))
        .getSQL()

      expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" = "col10";`)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" = '2022-06-20T00:00:00.000Z';]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.eq(new Date(EPOCH_2022_06_20)))
        .getSQL()

      expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" = '2022-06-20T00:00:00.000Z';`)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" = $1;]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.eq$(new Date(EPOCH_2022_06_20)))

      const expected = {
        sql: `SELECT "col9" FROM "table1" WHERE "col9" = $1;`,
        values: [new Date(EPOCH_2022_06_20)],
      }
      expect(actual.getSQL()).toEqual(expected.sql)
      expect(actual.getBindValues()).toEqual(expected.values)
    })
  })
  describe(`Not Equal operator`, () => {
    it(`Produces [SELECT * FROM "table1" WHERE "col9" <> "col10";]`, () => {
      const actual = sql
        .selectAsteriskFrom(table)
        .where(col9.ne(col10))
        .getSQL()

      expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" <> "col10";`)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <> '2022-06-20T00:00:00.000Z';]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.ne(new Date(EPOCH_2022_06_20)))
        .getSQL()

      expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" <> '2022-06-20T00:00:00.000Z';`)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <> $1;]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.ne$(new Date(EPOCH_2022_06_20)))

      const expected = {
        sql: `SELECT "col9" FROM "table1" WHERE "col9" <> $1;`,
        values: [new Date(EPOCH_2022_06_20)],
      }
      expect(actual.getSQL()).toEqual(expected.sql)
      expect(actual.getBindValues()).toEqual(expected.values)
    })
  })
  describe(`Greater Than operator`, () => {
    it(`Produces [SELECT * FROM "table1" WHERE "col9" > "col10";]`, () => {
      const actual = sql
        .selectAsteriskFrom(table)
        .where(col9.gt(col10))
        .getSQL()

      expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" > "col10";`)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" > '2022-06-20T00:00:00.000Z';]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.gt(new Date(EPOCH_2022_06_20)))
        .getSQL()

      expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" > '2022-06-20T00:00:00.000Z';`)
    })
    it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" > $1;]`, () => {
      const actual = sql
        .select(col9)
        .from(table)
        .where(col9.gt$(new Date(EPOCH_2022_06_20)))

      const expected = {
        sql: `SELECT "col9" FROM "table1" WHERE "col9" > $1;`,
        values: [new Date(EPOCH_2022_06_20)],
      }
      expect(actual.getSQL()).toEqual(expected.sql)
      expect(actual.getBindValues()).toEqual(expected.values)
    })
  })
  describe(`When date value is null`, () => {
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
