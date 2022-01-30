import {
  Builder,
  Database,
  Table,
  TextColumn,
} from '../src'
import { ALL, DISTINCT } from '../src/singletoneConstants'

describe('test orderBy Step', () => {
  // database schema
  const column1 = new TextColumn('col1')
  const column2 = new TextColumn('col2')
  const table = new Table(
    'testTable',
    [column1, column2],
  )
  const db = new Database([table], 1)
  const sql = new Builder(db)

  it('Produces [SELECT DISTINCT col1, col2 FROM testTable;]', () => {
    const actual = sql
      .selectDistinct(column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT DISTINCT col1, col2 FROM testTable;')
  })

  it('Produces [SELECT ALL col1, col2 FROM testTable;]', () => {
    const actual = sql
      .selectAll(column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT ALL col1, col2 FROM testTable;')
  })

  it('Produces [SELECT DISTINCT col1, col2 FROM testTable;] using select first param', () => {
    const actual = sql
      .select(DISTINCT, column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT DISTINCT col1, col2 FROM testTable;')
  })

  it('Produces [SELECT ALL col1, col2 FROM testTable;] using select first param', () => {
    const actual = sql
      .select(ALL, column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT ALL col1, col2 FROM testTable;')
  })
})
