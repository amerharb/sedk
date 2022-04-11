import {
  Builder,
  ALL,
} from '../src'
import { database } from './database'

//Alias
const table = database.s.public.t.table1

describe('Test LIMIT and OFFSET Steps', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })

  it('Produces [SELECT * FROM "table1" LIMIT 50 OFFSET 10;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit(50)
      .offset(10)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "table1" LIMIT 50 OFFSET 10;')
  })

  it('Produces [SELECT * FROM "table1" LIMIT $1 OFFSET $2;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit$(50)
      .offset$(10)
      .getBinds()

    const expected = {
      sql: 'SELECT * FROM "table1" LIMIT $1 OFFSET $2;',
      values: [50, 10],
    }

    expect(actual).toEqual(expected)
  })

  describe('LIMIT and OFFSET after Where Step', () => {
    it('Produces [SELECT * FROM "table1" WHERE "col1" = \'a\' LIMIT 50;]', () => {
      const actual = sql
        .selectAsteriskFrom(table)
        .where(table.c.col1.eq('a'))
        .limit(50)
        .getSQL()

      expect(actual).toEqual('SELECT * FROM "table1" WHERE "col1" = \'a\' LIMIT 50;')
    })

    it('Produces [SELECT * FROM "table1" WHERE "col1" = \'a\' OFFSET 10;]', () => {
      const actual = sql
        .selectAsteriskFrom(table)
        .where(table.c.col1.eq('a'))
        .offset(10)
        .getSQL()

      expect(actual).toEqual('SELECT * FROM "table1" WHERE "col1" = \'a\' OFFSET 10;')
    })

    it('Produces [SELECT * FROM "table1" WHERE "col1" = \'a\' LIMIT $1;]', () => {
      const actual = sql
        .selectAsteriskFrom(table)
        .where(table.c.col1.eq('a'))
        .limit$(50)
        .getBinds()

      const expected = {
        sql: 'SELECT * FROM "table1" WHERE "col1" = \'a\' LIMIT $1;',
        values: [50],
      }

      expect(actual).toEqual(expected)
    })

    it('Produces [SELECT * FROM "table1" WHERE "col1" = \'a\' OFFSET $1;]', () => {
      const actual = sql
        .selectAsteriskFrom(table)
        .where(table.c.col1.eq('a'))
        .offset$(10)
        .getBinds()

      const expected = {
        sql: 'SELECT * FROM "table1" WHERE "col1" = \'a\' OFFSET $1;',
        values: [10],
      }

      expect(actual).toEqual(expected)
    })
  })

  describe('LIMIT and OFFSET after Having Step', () => {
    it('Produces [SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING SUM("col1") = \'a\' LIMIT 50;]', () => {
      const actual = sql
        .select(table.c.col1, table.c.col4.sum)
        .from(table)
        .groupBy(table.c.col1)
        .having(table.c.col1.eq('a') )
        .limit(50)
        .getSQL()

      expect(actual).toEqual('SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' LIMIT 50;')
    })

    it('Produces [SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' OFFSET 10;]', () => {
      const actual = sql
        .select(table.c.col1, table.c.col4.sum)
        .from(table)
        .groupBy(table.c.col1)
        .having(table.c.col1.eq('a') )
        .offset(10)
        .getSQL()

      expect(actual).toEqual('SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' OFFSET 10;')
    })

    it('Produces [SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' LIMIT $1;]', () => {
      const actual = sql
        .select(table.c.col1, table.c.col4.sum)
        .from(table)
        .groupBy(table.c.col1)
        .having(table.c.col1.eq('a') )
        .limit$(50)
        .getBinds()

      const expected = {
        sql: 'SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' LIMIT $1;',
        values: [50],
      }

      expect(actual).toEqual(expected)
    })

    it('Produces [SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' OFFSET $1;]', () => {
      const actual = sql
        .select(table.c.col1, table.c.col4.sum)
        .from(table)
        .groupBy(table.c.col1)
        .having(table.c.col1.eq('a') )
        .offset$(10)
        .getBinds()

      const expected = {
        sql: 'SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' OFFSET $1;',
        values: [10],
      }

      expect(actual).toEqual(expected)
    })
  })

  it('Produces [SELECT * FROM "table1" LIMIT 50;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit(50)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "table1" LIMIT 50;')
  })

  it('Produces [SELECT * FROM "table1" LIMIT $1;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit$(50)
      .getBinds()

    const expected = {
      sql: 'SELECT * FROM "table1" LIMIT $1;',
      values: [50],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT * FROM "table1" LIMIT NULL;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit(null)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "table1" LIMIT NULL;')
  })

  it('Produces [SELECT * FROM "table1" LIMIT ALL;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit(ALL)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "table1" LIMIT ALL;')
  })

  it('Produces [SELECT * FROM "table1" LIMIT $1;] ($1 = null)', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit$(null)
      .getBinds()

    const expected = {
      sql: 'SELECT * FROM "table1" LIMIT $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT * FROM "table1" OFFSET 10;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .offset(10)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "table1" OFFSET 10;')
  })

  it('Produces [SELECT * FROM "table1" OFFSET $1;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .offset$(10)
      .getBinds()

    const expected = {
      sql: 'SELECT * FROM "table1" OFFSET $1;',
      values: [10],
    }

    expect(actual).toEqual(expected)
  })
})
