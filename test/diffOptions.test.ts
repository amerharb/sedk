import { Builder, Database, e, Table, TextColumn } from '../src'

describe('test from one table', () => {
  // database schema
  const column1 = new TextColumn('col1')

  const table = new Table(
    'testTable',
    [column1],
  )
  const db = new Database([table], 1)
  const sql = new Builder(db, { useSemicolonAtTheEnd: false })

  it('Produces [SELECT 1 FROM testTable] without semicolon', () => {
    const actual = sql
      .select(e(1))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT 1 FROM testTable')
  })
})
