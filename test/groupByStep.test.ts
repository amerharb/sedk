import { Builder, f, e, ArithmeticOperator } from '../src'
import { database } from './database'

//Alias
const ADD = ArithmeticOperator.ADD
const table = database.s.public.t.testTable
const column1 = database.s.public.t.testTable.c.column1
const column2 = database.s.public.t.testTable.c.column2
const column3 = database.s.public.t.testTable.c.column3
const column4 = database.s.public.t.testTable.c.column4
const column5 = database.s.public.t.testTable.c.column5
const column6 = database.s.public.t.testTable.c.column6

describe('test groupBy Step', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1";')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" GROUP BY "col1", "col2";]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .groupBy(column1, column2)
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" GROUP BY "col1", "col2";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' GROUP BY "col1";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column2.eq('a'))
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' GROUP BY "col1";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' AND "col3" = \'b\' GROUP BY "col1";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column2.eq('a'))
      .and(column3.eq('b'))
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' AND "col3" = \'b\' GROUP BY "col1";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' OR "col3" = \'b\' GROUP BY "col1";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column2.eq('a'))
      .or(column3.eq('b'))
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col2" = \'a\' OR "col3" = \'b\' GROUP BY "col1";')
  })

  it('Produces [SELECT SUM("col4"), SUM(1) FROM "testTable" GROUP BY "col2";]', () => {
    const actual = sql
      .select(f.sum(column4), f.sum(1))
      .from(table)
      .groupBy(column2)
      .getSQL()

    expect(actual).toEqual('SELECT SUM("col4"), SUM(1) FROM "testTable" GROUP BY "col2";')
  })

  it('Produces [SELECT SUM("col4"), AVG("col5") FROM "testTable" GROUP BY "col2";]', () => {
    const actual = sql
      .select(f.sum(column4), f.avg(column5))
      .from(table)
      .groupBy(column2)
      .getSQL()

    expect(actual).toEqual('SELECT SUM("col4"), AVG("col5") FROM "testTable" GROUP BY "col2";')
  })

  it('Produces [SELECT COUNT("col4"), MAX("col5"), MIN("col6") FROM "testTable" GROUP BY "col2";]', () => {
    const actual = sql
      .select(f.count(column4), f.max(column5), f.min(column6))
      .from(table)
      .groupBy(column2)
      .getSQL()

    expect(actual).toEqual('SELECT COUNT("col4"), MAX("col5"), MIN("col6") FROM "testTable" GROUP BY "col2";')
  })

  it('Produces [SELECT SUM("col4"), AVG("col4"), COUNT("col4"), MAX("col4"), MIN("col4") FROM "testTable" GROUP BY "col2";]', () => {
    const actual = sql
      .select(column4.sum, column4.avg, column4.count, column4.max, column4.min)
      .from(table)
      .groupBy(column2)
      .getSQL()

    expect(actual).toEqual('SELECT SUM("col4"), AVG("col4"), COUNT("col4"), MAX("col4"), MIN("col4") FROM "testTable" GROUP BY "col2";')
  })

  it('Produces [SELECT SUM("col4") AS "SUM_OF_COL4", SUM(1) AS "SUM_OF_1", SUM(col5) AS "SUM_OF_COL5" FROM "testTable" GROUP BY "col1";]', () => {
    const actual = sql
      .select(
        f.sum(column4).as('SUM_OF_COL4'),
        f.sum(1).as('SUM_OF_1'),
        column5.sum.as('SUM_OF_COL5'),
      )
      .from(table)
      .groupBy(column2)
      .getSQL()

    expect(actual).toEqual('SELECT SUM("col4") AS "SUM_OF_COL4", SUM(1) AS "SUM_OF_1", SUM("col5") AS "SUM_OF_COL5" FROM "testTable" GROUP BY "col2";')
  })

  it('Produces [SELECT SUM("col4" + "col5") FROM "testTable" GROUP BY "col1";]', () => {
    const actual = sql
      .select(f.sum(e(column4, ADD, column5)))
      .from(table)
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT SUM("col4" + "col5") FROM "testTable" GROUP BY "col1";')
  })

  it('Produces [SELECT SUM("col4" + 1) FROM "testTable" GROUP BY "col1";]', () => {
    const actual = sql
      .select(f.sum(e(column4, ADD, 1)))
      .from(table)
      .groupBy(column1)
      .getSQL()

    expect(actual).toEqual('SELECT SUM("col4" + 1) FROM "testTable" GROUP BY "col1";')
  })
})
