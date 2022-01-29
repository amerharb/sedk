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
    const sqlWhenSpecified = new Builder(db, { addAscAfterOrderByItem: 'when specified' })
    const sqlDefault = new Builder(db, { addAscAfterOrderByItem: 'when specified' })
    it('Produces [SELECT col1 FROM testTable ORDER BY col1 ASC;]', () => {
      const actual = sqlAlways
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1 ASC;')
    })

    it('Produces [SELECT col1 FROM testTable ORDER BY col1;]', () => {
      const actual = sqlNever
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    //TODO: fix this test case when Specified option supported
    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] (when specified)', () => {
      const actual = sqlWhenSpecified
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })

    //TODO: fix this test case when Specified option supported
    it('Produces [SELECT col1 FROM testTable ORDER BY col1;] (Default)', () => {
      const actual = sqlDefault
        .select(column1)
        .from(table)
        .orderBy(column1)
        .getSQL()

      expect(actual).toEqual('SELECT col1 FROM testTable ORDER BY col1;')
    })
  })
})
