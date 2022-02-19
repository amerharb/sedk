import {
  Builder,
  Schema,
  Table,
  TextColumn,
  ALL,
  DISTINCT,
} from '../src'

describe('test orderBy Step', () => {
  // database schema
  const column1 = new TextColumn('col1')
  const column2 = new TextColumn('col2')
  const table = new Table(
    'testTable',
    [column1, column2],
  )
  const schema = new Schema([table])
  const sql = new Builder(schema)

  /* In Postgres it is allowed to have FROM directly
   after SELECT with or without ALL
   */
  it('Produces [SELECT ALL FROM "testTable";]', () => {
    const actual = sql
      .selectAll()
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT ALL FROM "testTable";')
  })

  it('Produces [SELECT DISTINCT "col1", "col2" FROM "testTable";]', () => {
    const actual = sql
      .selectDistinct(column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT DISTINCT "col1", "col2" FROM "testTable";')
  })

  it('Produces [SELECT ALL "col1", "col2" FROM "testTable";]', () => {
    const actual = sql
      .selectAll(column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT ALL "col1", "col2" FROM "testTable";')
  })

  it('Produces [SELECT DISTINCT "col1", "col2" FROM "testTable";] using select first param', () => {
    const actual = sql
      .select(DISTINCT, column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT DISTINCT "col1", "col2" FROM "testTable";')
  })

  it('Produces [SELECT ALL "col1", "col2" FROM "testTable";] using select first param', () => {
    const actual = sql
      .select(ALL, column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT ALL "col1", "col2" FROM "testTable";')
  })

  it('Produces [SELECT ALL FROM "testTable";] only ALL is valid (as param)', () => {
    const actual = sql
      .select(ALL)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT ALL FROM "testTable";')
  })

  it('Produces [SELECT ALL FROM "testTable";] only ALL is valid (using selectAll())', () => {
    const actual = sql
      .selectAll()
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT ALL FROM "testTable";')
  })
})
