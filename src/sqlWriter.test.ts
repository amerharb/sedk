'use strict'
import * as sql from './sqlWriter'

describe('test from one table', () => {
  // database schema
  const column1 = new sql.Column('col1',)
  const column2 = new sql.Column('col2',)
  const column3 = new sql.Column('col3',)
  const table = new sql.Table('testTable', [column1, column2, column3])

  it('has correct select 1 column from one table', () => {

    const asql = new sql.ASql([table])

    const case1 = asql
      .select(column1)
      .from(table)
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')

    expect(case1).toContain('SELECT col1 FROM testTable')
  })

  it('has correct select 2 columns from one table', () => {

    const asql = new sql.ASql([table])

    const case1 = asql
      .select(column1, column2)
      .from(table)
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')

    expect(case1).toContain('SELECT col1, col2 FROM testTable')
  })

  it('has correct select 2 columns from one table with where has 1 condition', () => {

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
