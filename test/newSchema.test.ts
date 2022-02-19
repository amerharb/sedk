import {
  Builder,
  BooleanColumn,
  Schema,
  NumberColumn,
  Table,
  TextColumn,
  ALL,
} from '../src'
import { Database } from '../src/schema'

describe('Test LIMIT and OFFSET Steps', () => {
  // database schema

  const sql = new Builder(schema)

  it('Produces [SELECT * FROM "testTable" LIMIT 50 OFFSET 10;]', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .limit(50)
      .offset(10)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable" LIMIT 50 OFFSET 10;')
  })
})
