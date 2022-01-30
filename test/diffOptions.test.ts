import { Builder, Database, Table, TextColumn } from '../src'

describe('test Options', () => {
  const column1 = new TextColumn('col1')

  const table = new Table(
    'testTable',
    [column1],
  )
  const db = new Database([table], 1)

  describe('test Semicolon Option', () => {
    const sqlWithoutSemicolon = new Builder(db, { useSemicolonAtTheEnd: false })
    const sqlWithSemicolon = new Builder(db, { useSemicolonAtTheEnd: true })
    const sqlDefault = new Builder(db)
    it('Produces [SELECT 1 FROM testTable] without semicolon', () => {
      const actual = sqlWithoutSemicolon
        .select(1)
        .from(table)
        .getSQL()

      expect(actual).toEqual('SELECT 1 FROM testTable')
    })

    it('Produces [SELECT 1 FROM testTable] without semicolon;', () => {
      const actual = sqlWithSemicolon
        .select(1)
        .from(table)
        .getSQL()

      expect(actual).toEqual('SELECT 1 FROM testTable;')
    })

    it('Produces [SELECT 1 FROM testTable] without semicolon; (default)', () => {
      const actual = sqlDefault
        .select(1)
        .from(table)
        .getSQL()

      expect(actual).toEqual('SELECT 1 FROM testTable;')
    })
  })

  describe('test OrderBy ASC Option', () => {
    const sqlAlways = new Builder(db, { addAscAfterOrderByItem: 'always' })
    const sqlNever = new Builder(db, { addAscAfterOrderByItem: 'never' })
    const sqlWhenMentioned = new Builder(db, { addAscAfterOrderByItem: 'when mentioned' })
    const sqlDefault = new Builder(db)
    it('Produces [SELECT col1 FROM testTable ORDER BY col1 ASC;] option(always)', () => {
      const actual = sqlAlways
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1 ASC;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] option(never)', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] option(never) even asc mentioned', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1 ASC;] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(column1)
        .from(table)
        .orderBy(column1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1 ASC;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] option(Default)', () => {
      const actual = sqlDefault
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1 ASC;] option(Default)', () => {
      const actual = sqlDefault
        .select(column1)
        .from(table)
        .orderBy(column1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1 ASC;')
    })
  })

  describe('test OrderBy NULLS LAST Option', () => {
    const sqlAlways = new Builder(db, { addNullsLastAfterOrderByItem: 'always' })
    const sqlNever = new Builder(db, { addNullsLastAfterOrderByItem: 'never' })
    const sqlWhenMentioned = new Builder(db, { addNullsLastAfterOrderByItem: 'when mentioned' })
    const sqlDefault = new Builder(db)
    it('Produces [SELECT col1 FROM testTable ORDER BY col1 NULLS LAST;] option(always)', () => {
      const actual = sqlAlways
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1 NULLS LAST;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] option(never)', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] option(never) even nulls last mentioned', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1.nullsLast)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1 ASC;] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(column1)
        .from(table)
        .orderBy(column1.asc)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1 ASC;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] option(when mentioned)', () => {
      const actual = sqlWhenMentioned
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] option(Default)', () => {
      const actual = sqlDefault
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1 NULLS LAST;] option(Default)', () => {
      const actual = sqlDefault
        .select(column1)
        .from(table)
        .orderBy(column1.nullsLast)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1 NULLS LAST;')
    })
  })
})
