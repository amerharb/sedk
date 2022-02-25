import {
  Builder,
  ALL,
} from '../src'
import {
  database,
  table,
} from './database'

describe('Test LIMIT and OFFSET Steps', () => {
  const sql = new Builder(database)

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

  it('Produces [SELECT * FROM "testTable" LIMIT ALL;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit(ALL)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" LIMIT ALL;')
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
