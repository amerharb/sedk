'use strict'
import * as sql from './sqlWriter'
import { Operator } from './sqlWriter'

describe('test from one table', () => {
  // database schema
  const column1 = new sql.Column('col1',)
  const column2 = new sql.Column('col2',)
  const column3 = new sql.Column('col3',)
  const table = new sql.Table('testTable', [column1, column2, column3])
  const db = new sql.Database([table], 1)
  const asql = new sql.ASql(db)

  it('has correct select 1 column from one table', () => {
    const received = asql
      .select(column1)
      .from(table)
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')

    expect(received).toContain('SELECT col1 FROM testTable')
  })

  it('has correct select 2 columns from one table', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')

    expect(received).toContain('SELECT col1, col2 FROM testTable')
  })

  it('has correct select 2 columns from one table with where has 1 condition', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE col1 = x')
  })

  it('has correct select 2 columns from one table with where has 2 conditions with AND inside parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'), sql.Operator.AND, column2.isEqual('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE ( col1 = x AND col2 = y )')
  })

  it('has correct select 2 columns from one table with where has 2 conditions with OR inside parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'), sql.Operator.OR, column2.isEqual('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE ( col1 = x OR col2 = y )')
  })

  it('has correct select 2 columns from one table with where has 1 condition then AND after it without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'))
      .and(column2.isEqual('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE col1 = x AND col2 = y')
  })

  it('has correct select 2 columns from one table with where has 2 conditions then AND after it without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'), Operator.OR, column2.isEqual('y'))
      .and(column3.isEqual('z'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE ( col1 = x OR col2 = y ) AND col3 = z')
  })

  it('has correct select 2 columns from one table with where has 1 condition then AND after it without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'))
      .or(column2.isEqual('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE col1 = x OR col2 = y')
  })

  it('has correct select 2 columns from one table with where has 2 conditions then OR after it without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'), Operator.AND, column2.isEqual('y'))
      .or(column3.isEqual('z'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE ( col1 = x AND col2 = y ) OR col3 = z')
  })

  it('has correct select 2 columns from one table with where has 1 condition then OR after it then AND without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'), Operator.AND, column2.isEqual('y'))
      .and(column3.isEqual('z1'))
      .or(column3.isEqual('z2'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE ( col1 = x AND col2 = y ) AND col3 = z1 OR col3 = z2')
  })
})
