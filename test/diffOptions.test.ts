import { Builder } from '../src'
import { database } from './database'
//Alias
const table = database.s.public.t.testTable
const column1 = database.s.public.t.testTable.c.column1
const column2 = database.s.public.t.testTable.c.column2

describe('test Options', () => {
  describe('test Semicolon Option', () => {
    const sqlWithoutSemicolon = new Builder(database, { useSemicolonAtTheEnd: false })
    const sqlWithSemicolon = new Builder(database, { useSemicolonAtTheEnd: true })
    const sqlDefault = new Builder(database)
    it('Produces [SELECT 1 FROM "testTable"] without semicolon', () => {
      const actual = sqlWithoutSemicolon
        .select(1)
        .from(table)
        .getSQL()

      expect(actual).toEqual('SELECT 1 FROM "testTable"')
    })

    it('Produces [SELECT 1 FROM "testTable"] without semicolon;', () => {
      const actual = sqlWithSemicolon
        .select(1)
        .from(table)
        .getSQL()

      expect(actual).toEqual('SELECT 1 FROM "testTable";')
    })

    it('Produces [SELECT 1 FROM "testTable"] without semicolon; (default)', () => {
      const actual = sqlDefault
        .select(1)
        .from(table)
        .getSQL()

      expect(actual).toEqual('SELECT 1 FROM "testTable";')
    })
  })

  describe('test OrderBy ASC Option', () => {
    const sqlAlways = new Builder(database, { addAscAfterOrderByItem: 'always' })
    const sqlNever = new Builder(database, { addAscAfterOrderByItem: 'never' })
    const sqlWhenMentioned = new Builder(database, { addAscAfterOrderByItem: 'when mentioned' })
    const sqlDefault = new Builder(database)
    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;] option(always)', () => {
      const actual = sqlAlways
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(never)', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1", "col2" DESC;] option(never)', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1, column2.desc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1", "col2" DESC;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(never) even asc mentioned', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(column1)
        .from(table)
        .orderBy(column1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(Default)', () => {
      const actual = sqlDefault
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;] option(Default)', () => {
      const actual = sqlDefault
        .select(column1)
        .from(table)
        .orderBy(column1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;')
    })
  })

  describe('test OrderBy NULLS LAST Option', () => {
    const sqlAlways = new Builder(database, { addNullsLastAfterOrderByItem: 'always' })
    const sqlNever = new Builder(database, { addNullsLastAfterOrderByItem: 'never' })
    const sqlWhenMentioned = new Builder(database, { addNullsLastAfterOrderByItem: 'when mentioned' })
    const sqlDefault = new Builder(database)
    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS LAST;] option(always)', () => {
      const actual = sqlAlways
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS LAST;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(never)', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS FIRST ;] option(never)', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1.nullsFirst)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS FIRST;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(never) even nulls last mentioned', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1.nullsLast)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(column1)
        .from(table)
        .orderBy(column1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(Default)', () => {
      const actual = sqlDefault
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS LAST;] option(Default)', () => {
      const actual = sqlDefault
        .select(column1)
        .from(table)
        .orderBy(column1.nullsLast)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS LAST;')
    })
  })

  describe('test SelectItems AS Option', () => {
    const sqlAlways = new Builder(database, { addAsBeforeColumnAlias: 'always' })
    const sqlNever = new Builder(database, { addAsBeforeColumnAlias: 'never' })
    const sqlDefault = new Builder(database)
    it('Produces [SELECT "col1" AS "C1" FROM "testTable";] option(always)', () => {
      const actual = sqlAlways
        .select(column1.as('C1'))
        .from(table)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" AS "C1" FROM "testTable";')
    })

    it('Produces [SELECT "col1" FROM "testTable";] option(never)', () => {
      const actual = sqlNever
        .select(column1.as('C1'))
        .from(table)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" "C1" FROM "testTable";')
    })

    it('Produces [SELECT "col1" AS "C1" FROM "testTable";] option(default)', () => {
      const actual = sqlDefault
        .select(column1.as('C1'))
        .from(table)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" AS "C1" FROM "testTable";')
    })
  })
})
