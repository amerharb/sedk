import { Builder } from '../src'
import { database } from './database'
//Alias
const testTable = database.s.public.t.testTable
const col1 = database.s.public.t.testTable.c.col1
const col2 = database.s.public.t.testTable.c.col2
const table2 = database.s.public.t.table2
const table2col1 = database.s.public.t.table2.c.col1
const table1 = database.s.schema1.t.table1

describe('test Options', () => {
  describe('test useSemicolonAtTheEnd Option', () => {
    const sqlWithoutSemicolon = new Builder(database, { useSemicolonAtTheEnd: false })
    const sqlWithSemicolon = new Builder(database, { useSemicolonAtTheEnd: true })
    const sqlDefault = new Builder(database)
    it('Produces [SELECT 1 FROM "testTable"] without semicolon', () => {
      const actual = sqlWithoutSemicolon
        .select(1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT 1 FROM "testTable"')
    })

    it('Produces [SELECT 1 FROM "testTable"] without semicolon;', () => {
      const actual = sqlWithSemicolon
        .select(1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT 1 FROM "testTable";')
    })

    it('Produces [SELECT 1 FROM "testTable"] without semicolon; (default)', () => {
      const actual = sqlDefault
        .select(1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT 1 FROM "testTable";')
    })
  })

  describe('test addAscAfterOrderByItem Option', () => {
    const sqlAlways = new Builder(database, { addAscAfterOrderByItem: 'always' })
    const sqlNever = new Builder(database, { addAscAfterOrderByItem: 'never' })
    const sqlWhenMentioned = new Builder(database, { addAscAfterOrderByItem: 'when mentioned' })
    const sqlDefault = new Builder(database)
    afterEach(() => {
      sqlAlways.cleanUp()
      sqlNever.cleanUp()
      sqlWhenMentioned.cleanUp()
      sqlDefault.cleanUp()
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;] option(always)', () => {
      const actual = sqlAlways
        .select(col1)
        .from(testTable)
        .orderBy(col1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(never)', () => {
      const actual = sqlNever
        .select(col1)
        .from(testTable)
        .orderBy(col1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1", "col2" DESC;] option(never)', () => {
      const actual = sqlNever
        .select(col1)
        .from(testTable)
        .orderBy(col1, col2.desc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1", "col2" DESC;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(never) even asc mentioned', () => {
      const actual = sqlNever
        .select(col1)
        .from(testTable)
        .orderBy(col1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(col1)
        .from(testTable)
        .orderBy(col1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(col1)
        .from(testTable)
        .orderBy(col1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(Default)', () => {
      const actual = sqlDefault
        .select(col1)
        .from(testTable)
        .orderBy(col1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;] option(Default)', () => {
      const actual = sqlDefault
        .select(col1)
        .from(testTable)
        .orderBy(col1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;')
    })
  })

  describe('test addNullsLastAfterOrderByItem Option', () => {
    const sqlAlways = new Builder(database, { addNullsLastAfterOrderByItem: 'always' })
    const sqlNever = new Builder(database, { addNullsLastAfterOrderByItem: 'never' })
    const sqlWhenMentioned = new Builder(database, { addNullsLastAfterOrderByItem: 'when mentioned' })
    const sqlDefault = new Builder(database)
    afterEach(() => {
      sqlAlways.cleanUp()
      sqlNever.cleanUp()
      sqlWhenMentioned.cleanUp()
      sqlDefault.cleanUp()
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS LAST;] option(always)', () => {
      const actual = sqlAlways
        .select(col1)
        .from(testTable)
        .orderBy(col1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS LAST;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(never)', () => {
      const actual = sqlNever
        .select(col1)
        .from(testTable)
        .orderBy(col1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS FIRST ;] option(never)', () => {
      const actual = sqlNever
        .select(col1)
        .from(testTable)
        .orderBy(col1.nullsFirst)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS FIRST;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(never) even nulls last mentioned', () => {
      const actual = sqlNever
        .select(col1)
        .from(testTable)
        .orderBy(col1.nullsLast)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(col1)
        .from(testTable)
        .orderBy(col1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" ASC;')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(col1)
        .from(testTable)
        .orderBy(col1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1";] option(Default)', () => {
      const actual = sqlDefault
        .select(col1)
        .from(testTable)
        .orderBy(col1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1";')
    })

    it('Produces [SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS LAST;] option(Default)', () => {
      const actual = sqlDefault
        .select(col1)
        .from(testTable)
        .orderBy(col1.nullsLast)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable" ORDER BY "col1" NULLS LAST;')
    })
  })

  describe('test addAsBeforeColumnAlias Option', () => {
    const sqlAlways = new Builder(database, { addAsBeforeColumnAlias: 'always' })
    const sqlNever = new Builder(database, { addAsBeforeColumnAlias: 'never' })
    const sqlDefault = new Builder(database)

    afterEach(() => {
      sqlAlways.cleanUp()
      sqlNever.cleanUp()
      sqlDefault.cleanUp()
    })

    it('Produces [SELECT "col1" AS "C1" FROM "testTable";] option(always)', () => {
      const actual = sqlAlways
        .select(col1.as('C1'))
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" AS "C1" FROM "testTable";')
    })

    it('Produces [SELECT "col1" FROM "testTable";] option(never)', () => {
      const actual = sqlNever
        .select(col1.as('C1'))
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" "C1" FROM "testTable";')
    })

    it('Produces [SELECT "col1" AS "C1" FROM "testTable";] option(default)', () => {
      const actual = sqlDefault
        .select(col1.as('C1'))
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" AS "C1" FROM "testTable";')
    })
  })

  describe('test addPublicSchemaName Option', () => {
    const sqlAlways = new Builder(database, { addPublicSchemaName: 'always' })
    const sqlWhen = new Builder(database, { addPublicSchemaName: 'when other schema mentioned' })
    const sqlNever = new Builder(database, { addPublicSchemaName: 'never' })
    const sqlDefault = new Builder(database)

    afterEach(() => {
      sqlAlways.cleanUp()
      sqlWhen.cleanUp()
      sqlNever.cleanUp()
      sqlDefault.cleanUp()
    })

    it('Produces [SELECT "col1" FROM "public"."testTable";] option(always)', () => {
      const actual = sqlAlways
        .select(col1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "public"."testTable";')
    })

    it('Produces [SELECT "col1" FROM "testTable";] option(when)', () => {
      //TODO: add another table to this test when builder takes more than one table
      const actual = sqlWhen
        .select(col1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable";')
    })

    it('Produces [SELECT "col1" FROM "testTable";] option(never)', () => {
      //TODO: add another table to this test when builder takes more than one table
      const actual = sqlNever
        .select(col1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable";')
    })


    it('Produces [SELECT "col1" FROM "schema1"."table1";] option(never)', () => {
      const actual = sqlNever
        .select(table1.c.col1)
        .from(table1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "schema1"."table1";')
    })

    it('Produces [SELECT "col1" FROM "testTable";] option(default)', () => {
      //TODO: add another table to this test when builder takes more than one table
      const actual = sqlDefault
        .select(col1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable";')
    })

    it('Produces [SELECT "col1" FROM "schema1"."table1";] option(default)', () => {
      const actual = sqlDefault
        .select(table1.c.col1)
        .from(table1)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "schema1"."table1";')
    })
  })

  describe('test addTableName Option', () => {
    const sqlAlways = new Builder(database, { addTableName: 'always' })
    const sqlWhen = new Builder(database, { addTableName: 'when two tables or more' })
    const sqlDefault = new Builder(database)

    afterEach(() => {
      sqlAlways.cleanUp()
      sqlWhen.cleanUp()
      sqlDefault.cleanUp()
    })

    it('Produces [SELECT "testTable"."col1" FROM "testTable";] option(always)', () => {
      const actual = sqlAlways
        .select(col1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "testTable"."col1" FROM "testTable";')
    })

    it('Produces [SELECT "col1" FROM "testTable";] option(when)', () => {
      const actual = sqlWhen
        .select(col1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable";')
    })

    it('Produces [SELECT "testTable"."col1", "table2"."col1" FROM "testTable", "table2";] option(when)', () => {
      const actual = sqlWhen
        .select(col1, table2col1)
        .from(testTable, table2)
        .getSQL()

      expect(actual).toEqual('SELECT "testTable"."col1", "table2"."col1" FROM "testTable", "table2";')
    })

    it('Produces [SELECT "col1" FROM "testTable";] option(default)', () => {
      const actual = sqlDefault
        .select(col1)
        .from(testTable)
        .getSQL()

      expect(actual).toEqual('SELECT "col1" FROM "testTable";')
    })

    it('Produces [SELECT "testTable"."col1", "table2"."col1" FROM "testTable", "table2";] option(default)', () => {
      const actual = sqlDefault
        .select(col1, table2col1)
        .from(testTable, table2)
        .getSQL()

      expect(actual).toEqual('SELECT "testTable"."col1", "table2"."col1" FROM "testTable", "table2";')
    })
  })
})
