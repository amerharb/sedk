import {
  Database,
  Table,
  BooleanColumn,
  NumberColumn,
  TextColumn,
  ArithmeticOperator,
  Builder,
  e,
  o,
  ASC,
  DESC,
  OrderByNullsPosition,
} from '../src'

/** Aliases */
const NULLS_FIRST = OrderByNullsPosition.NULLS_FIRST
const NULLS_LAST = OrderByNullsPosition.NULLS_LAST

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

  it('Produces [SELECT * FROM "testTable" ORDER BY ("col4" + "col5");]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .orderBy(e(column4, ArithmeticOperator.ADD, column5))
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" ORDER BY ("col4" + "col5");')
  })

  it('Produces [SELECT * FROM "testTable" ORDER BY col1 DESC NULLS FIRST;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .orderBy(o(column1, DESC, OrderByNullsPosition.NULLS_FIRST))
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" ORDER BY "col1" DESC NULLS FIRST;')
  })

  it('Produces [SELECT * FROM "testTable" ORDER BY col1 ASC;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .orderBy(o(column1, DESC, OrderByNullsPosition.NULLS_FIRST))
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" ORDER BY "col1" DESC NULLS FIRST;')
  })

  it('Produces [SELECT * FROM "testTable" ORDER BY ("col4" + "col5") DESC;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .orderBy(o(e(column4, ArithmeticOperator.ADD, column5), DESC))
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" ORDER BY ("col4" + "col5") DESC;')
  })

  it('Produces [SELECT ("col4" + "col5") AS "Col:4+5" FROM "testTable" ORDER BY "Col:4+5";]', () => {
    const actual = sql
      .select(e(column4, ArithmeticOperator.ADD, column5).as('Col:4+5'))
      .from(table)
      .orderBy('Col:4+5')
      .getSQL()

    expect(actual).toEqual('SELECT ("col4" + "col5") AS "Col:4+5" FROM "testTable" ORDER BY "Col:4+5";')
  })

  it('Throws error when ORDER BY alias not exist', () => {
    function actual() {
      sql
        .select(column1.as('A'))
        .from(table)
        .orderBy('B')
        .getSQL()
    }

    expect(actual).toThrowError('Alias B is not exist, if this is a column, then it should be entered as Column class')
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

  it('Produces [SELECT "col1" AS "C1" FROM "testTable" ORDER BY "C1" DESC NULLS FIRST, "col2" ASC NULLS LAST;]', () => {
    const actual = sql
      .select(column1.as('C1'))
      .from(table)
      .orderBy('C1', DESC, NULLS_FIRST, column2, ASC, NULLS_LAST)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" AS "C1" FROM "testTable" ORDER BY "C1" DESC NULLS FIRST, "col2" ASC NULLS LAST;')
  })

  it('Produces [SELECT "col1" AS "C1" FROM "testTable" ORDER BY "C1" DESC, "col2" NULLS LAST;]', () => {
    const actual = sql
      .select(column1.as('C1'))
      .from(table)
      .orderBy('C1', DESC, column2, NULLS_LAST)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" AS "C1" FROM "testTable" ORDER BY "C1" DESC, "col2" NULLS LAST;')
  })

  it('Produces [SELECT "col1" AS " DESC" FROM "testTable" ORDER BY " DESC";]', () => {
    const actual = sql
      .select(column1.as(' DESC'))
      .from(table)
      .orderBy(' DESC')
      .getSQL()

    expect(actual).toEqual('SELECT "col1" AS " DESC" FROM "testTable" ORDER BY " DESC";')
  })
})
