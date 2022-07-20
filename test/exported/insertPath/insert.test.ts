import * as sedk from '../../../src'
import { database } from '../../database'

//Alias
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col4 = table1.c.col4
const col7 = table1.c.col7
const $ = sedk.$

describe('INSERT Path', () => {
  const sql = new sedk.Builder(database)
  afterEach(() => { sql.cleanUp() })
  const EPOCH_2022_07_20 = Date.UTC(2022, 6, 20)
  describe('Basic insert all', () => {
    it(`Produces [INSERT INTO "table1" VALUES('A', 1, TRUE, '2022-07-20T00:00:00.000Z');]`, () => {
      const actual = sql
        .insert()
        .into(table1)
        .values('A', 1, true, new Date(EPOCH_2022_07_20))
        .getSQL()
      expect(actual).toEqual(`INSERT INTO "table1" VALUES('A', 1, TRUE, '2022-07-20T00:00:00.000Z');`)
    })
    it(`Produces [INSERT INTO "table1" VALUES(NULL, 'B', 2, FALSE, '2022-07-20T00:00:00.000Z');]`, () => {
      const actual = sql
        .insertInto(table1)
        .values(null, 'B', 2, false, new Date(EPOCH_2022_07_20))
        .getSQL()
      expect(actual).toEqual(`INSERT INTO "table1" VALUES(NULL, 'B', 2, FALSE, '2022-07-20T00:00:00.000Z');`)
    })
  })
  describe('Insert specific column', () => {
    it(`Produces [INSERT INTO "table1"("col1") VALUES('A');]`, () => {
      const actual = sql.insertInto(table1, col1).values('A').getSQL()
      expect(actual).toEqual(`INSERT INTO "table1"("col1") VALUES('A');`)
    })
    it(`Produces [INSERT INTO "table1"("col1", "col4", "col7") VALUES('A', 1, TRUE);]`, () => {
      const actual = sql.insertInto(table1, col1, col4, col7).values('A', 1, true).getSQL()
      expect(actual).toEqual(`INSERT INTO "table1"("col1", "col4", "col7") VALUES('A', 1, TRUE);`)
    })
  })
  describe('Insert with returning step', () => {
    it(`Produces [INSERT INTO "table1" VALUES('A') RETURNING "col1";]`, () => {
      const actual = sql
        .insertInto(table1)
        .values('A')
        .returning(col1)
        .getSQL()
      expect(actual).toEqual(`INSERT INTO "table1" VALUES('A') RETURNING "col1";`)
    })
    it(`Produces [INSERT INTO "table1"("col1") VALUES('A') RETURNING "col1";]`, () => {
      const actual = sql
        .insertInto(table1, col1)
        .values('A')
        .returning(col1)
        .getSQL()
      expect(actual).toEqual(`INSERT INTO "table1"("col1") VALUES('A') RETURNING "col1";`)
    })
  })
  describe('Insert with binder $', () => {
    it(`Produces [INSERT INTO "table1" VALUES($1);]`, () => {
      const actual = sql.insertInto(table1).values($('A'))
      expect(actual.getSQL()).toEqual(`INSERT INTO "table1" VALUES($1);`)
      expect(actual.getBindValues()).toEqual(['A'])
    })
    it(`Produces [INSERT INTO "table1"("col1") VALUES($1);]`, () => {
      const actual = sql.insertInto(table1, col1).values($('A'))
      expect(actual.getSQL()).toEqual(`INSERT INTO "table1"("col1") VALUES($1);`)
      expect(actual.getBindValues()).toEqual(['A'])
    })
    it(`Produces [INSERT INTO "table1" VALUES($1, $2, $3);]`, () => {
      const actual = sql.insertInto(table1).values($('A'), $(1), $(true))
      expect(actual.getSQL()).toEqual(`INSERT INTO "table1" VALUES($1, $2, $3);`)
      expect(actual.getBindValues()).toEqual(['A', 1, true])
    })
    it(`Produces [INSERT INTO "table1" VALUES($1, 1, $2);]`, () => {
      const actual = sql.insertInto(table1).values($('A'), 1, $(true))
      expect(actual.getSQL()).toEqual(`INSERT INTO "table1" VALUES($1, 1, $2);`)
      expect(actual.getBindValues()).toEqual(['A', true])
    })
  })
})
