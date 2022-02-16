import {
  Builder,
  BooleanColumn,
  Database,
  NumberColumn,
  Table,
  TextColumn,
} from '../src'

describe('Test LIMIT and OFFSET Steps', () => {
  // database schema
  const column1 = new TextColumn('col1')
  const column2 = new TextColumn('col2')
  const column3 = new TextColumn('col3')
  const column4 = new NumberColumn('col4')
  const column5 = new NumberColumn('col5')
  const column6 = new NumberColumn('col6')
  const column7 = new BooleanColumn('col7')
  const column8 = new BooleanColumn('col8')
  const table = new Table(
    'testTable',
    [column1, column2, column3, column4, column5, column6, column7, column8],
  )
  const db = new Database([table], 1)
  const sql = new Builder(db)

  it('Produces [SELECT * FROM "testTable" LIMIT 50 OFFSET 10;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit(50)
      .offset(10)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" LIMIT 50 OFFSET 10;')
  })

  it('Produces [SELECT * FROM "testTable" LIMIT $1 OFFSET $2;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit$(50)
      .offset$(10)
      .getBinds()

    const expected = {
      sql: 'SELECT * FROM "testTable" LIMIT $1 OFFSET $2;',
      values: [50, 10],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT * FROM "testTable" LIMIT 50;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit(50)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" LIMIT 50;')
  })

  it('Produces [SELECT * FROM "testTable" LIMIT $1;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit$(50)
      .getBinds()

    const expected = {
      sql: 'SELECT * FROM "testTable" LIMIT $1;',
      values: [50],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT * FROM "testTable" LIMIT NULL;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit(null)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" LIMIT NULL;')
  })

  it('Produces [SELECT * FROM "testTable" LIMIT $1;] ($1 = null)', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit$(null)
      .getBinds()

    const expected = {
      sql: 'SELECT * FROM "testTable" LIMIT $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT * FROM "testTable" OFFSET 10;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .offset(10)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" OFFSET 10;')
  })

  it('Produces [SELECT * FROM "testTable" OFFSET $1;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .offset$(10)
      .getBinds()

    const expected = {
      sql: 'SELECT * FROM "testTable" OFFSET $1;',
      values: [10],
    }

    expect(actual).toEqual(expected)
  })
})
