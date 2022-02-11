import {
  Builder,
  BooleanColumn,
  Database,
  NumberColumn,
  Table,
  TextColumn,
} from '../src'


describe('test orderBy Step', () => {
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

  it('Produces [SELECT * FROM "testTable" ORDER BY "col1", "col2";]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .orderBy(column1, column2)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" ORDER BY "col1", "col2";')
  })

  it('Produces [SELECT * FROM "testTable" ORDER BY "col1" ASC, "col2" DESC;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .orderBy(column1.asc, column2.desc)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" ORDER BY "col1" ASC, "col2" DESC;')
  })

  it('Produces [SELECT * FROM "testTable" ORDER BY "col1" ASC, "col2" DESC, "col3" NULLS FIRST, "col4" NULLS LAST;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .orderBy(column1.asc, column2.desc, column3.nullsFirst, column4.nullsLast)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" ORDER BY "col1" ASC, "col2" DESC, "col3" NULLS FIRST, "col4" NULLS LAST;')
  })

  it('Produces [SELECT * FROM "testTable" ORDER BY "col1" ASC NULLS FIRST, "col2" DESC NULLS FIRST, "col3" ASC NULLS LAST, "col4" DESC NULLS LAST;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .orderBy(column1.ascNullsFirst, column2.descNullsFirst, column3.ascNullsLast, column4.descNullsLast)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" ORDER BY "col1" ASC NULLS FIRST, "col2" DESC NULLS FIRST, "col3" ASC NULLS LAST, "col4" DESC NULLS LAST;')
  })
})
