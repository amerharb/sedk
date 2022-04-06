import { Builder, LogicalOperator } from '../src'
import { database } from './database'

//Alias
const AND = LogicalOperator.AND
const OR = LogicalOperator.OR
const table = database.s.public.t.testTable
const col1 = table.c.col1
const col2 = table.c.col2
const col3 = table.c.col3
const col4 = table.c.col4

describe('test groupBy Step', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\';]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .groupBy(col1)
      .having(col1.eq('a'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\';')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' );]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .groupBy(col1)
      .having(col1.eq('a'), AND, col2.eq('b'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' OR "col3" = \'c\' );]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .groupBy(col1)
      .having(col1.eq('a'), AND, col2.eq('b'), OR, col3.eq('c'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' OR "col3" = \'c\' );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\';]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .groupBy(col1)
      .having(col1.eq('a'))
      .and(col2.eq('b'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\';')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = \'c\' );]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .groupBy(col1)
      .having(col1.eq('a'))
      .and(col2.eq('b'), OR, col3.eq('c'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = \'c\' );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = \'c\' AND "col4" = 4 );]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .groupBy(col1)
      .having(col1.eq('a'))
      .and(col2.eq('b'), OR, col3.eq('c'), AND, col4.eq(4))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = \'c\' AND "col4" = 4 );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' OR ( "col2" = \'b\' OR "col3" = \'c\' AND "col4" = 4 );]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .groupBy(col1)
      .having(col1.eq('a'))
      .or(col2.eq('b'), OR, col3.eq('c'), AND, col4.eq(4))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' OR ( "col2" = \'b\' OR "col3" = \'c\' AND "col4" = 4 );')
  })

  it('Produces [SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\' OR "col3" = \'c\';]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .groupBy(col1)
      .having(col1.eq('a'))
      .and(col2.eq('b'))
      .or(col3.eq('c'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\' OR "col3" = \'c\';')
  })
})
