'use strict'
import * as sql from './sqlWriter'

describe('simple SELECT FROM', () => {
  // database schema
  const column1 = new sql.Column('col1',)
  const column2 = new sql.Column('col2',)
  const column3 = new sql.Column('col3',)
  const table = new sql.Table('testTable', [column1, column2, column3])

  test('simple SELECT FROM', () => {

    const asql = new sql.ASql([table])

    const case1 = asql
      .select(column1, column2)
      .from(table)
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')

    expect(case1).toContain('SELECT col1, col2 FROM testTable')
  })

  test('simple SELECT FROM WHERE', () => {

    const asql = new sql.ASql([table])

    const case1 = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(case1).toEqual('SELECT col1, col2 FROM testTable WHERE col1 = x')
  })
})
