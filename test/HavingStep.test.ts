import { Builder, LogicalOperator } from '../src'
import { database } from './database'

//Alias
const AND = LogicalOperator.AND
const OR = LogicalOperator.OR
const table = database.s.public.t.testTable
const column1 = database.s.public.t.testTable.c.column1
const column2 = database.s.public.t.testTable.c.column2
const column3 = database.s.public.t.testTable.c.column3
const column4 = database.s.public.t.testTable.c.column4

describe('test groupBy Step', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\';]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .having(column1.eq('a'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\';')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' );]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .having(column1.eq('a'), AND, column2.eq('b'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' OR "col3" = \'c\' );]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .having(column1.eq('a'), AND, column2.eq('b'), OR, column3.eq('c'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' OR "col3" = \'c\' );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\';]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .having(column1.eq('a'))
      .and(column2.eq('b'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\';')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = \'c\' );]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .having(column1.eq('a'))
      .and(column2.eq('b'), OR, column3.eq('c'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = \'c\' );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = \'c\' AND "col4" = 4 );]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .having(column1.eq('a'))
      .and(column2.eq('b'), OR, column3.eq('c'), AND, column4.eq(4))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = \'c\' AND "col4" = 4 );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' OR ( "col2" = \'b\' OR "col3" = \'c\' AND "col4" = 4 );]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .having(column1.eq('a'))
      .or(column2.eq('b'), OR, column3.eq('c'), AND, column4.eq(4))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' OR ( "col2" = \'b\' OR "col3" = \'c\' AND "col4" = 4 );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\' OR "col3" = \'c\';]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .groupBy(column1)
      .having(column1.eq('a'))
      .and(column2.eq('b'))
      .or(column3.eq('c'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\' OR "col3" = \'c\';')
  })
})
