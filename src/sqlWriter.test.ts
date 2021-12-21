'use strict'
import * as sql from './sqlWriter'
import { Database, Table, TextColumn, NumberColumn } from './model'

//Alias
const AND = sql.Operator.AND
const OR = sql.Operator.OR

describe('test from one table', () => {
  // database schema
  const column1 = new TextColumn('col1')
  const column2 = new TextColumn('col2')
  const column3 = new TextColumn('col3')
  const column4 = new NumberColumn('col4')
  const table = new Table('testTable', [column1, column2, column3, column4])
  const db = new Database([table], 1)
  const asql = new sql.ASql(db)

  it('has correct select 1 column from one table', () => {
    const received = asql
      .select(column1)
      .from(table)
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
      .trim()

    expect(received).toEqual('SELECT col1 FROM testTable')
  })

  it('has correct select 2 columns from one table', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
      .trim()

    expect(received).toEqual('SELECT col1, col2 FROM testTable')
  })

  it('has correct select 2 columns from one table with where has 1 condition', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.equal('x'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x'")
  })

  it('has correct select 2 columns from one table with where has 1 condition for number column', () => {
    const received = asql
      .select(column1, column4)
      .from(table)
      .where(column4.equal(5))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col4 FROM testTable WHERE col4 = 5')
  })

  it('has correct select 2 columns from one table with where has 2 conditions with AND inside parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.equal('x'), AND, column2.equal('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' )")
  })

  it('has correct select 2 columns from one table with where has 2 conditions with OR inside parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.equal('x'), OR, column2.equal('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' )")
  })

  it('has correct select 2 columns from one table with where has 1 condition then AND after it without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.equal('x'))
      .and(column2.equal('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x' AND col2 = 'y'")
  })

  it('has correct select 2 columns from one table with where has 2 conditions then AND after it without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.equal('x'), OR, column2.equal('y'))
      .and(column3.equal('z'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' ) AND col3 = 'z'")
  })

  it('has correct select 2 columns from one table with where has 1 condition then OR after it without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.equal('x'))
      .or(column2.equal('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x' OR col2 = 'y'")
  })

  it('has correct select 2 columns from one table with where has 2 conditions then OR after it without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.equal('x'), AND, column2.equal('y'))
      .or(column3.equal('z'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) OR col3 = 'z'")
  })

  it('has correct select 2 columns from one table with where has 1 condition then OR after it then AND without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.equal('x'), AND, column2.equal('y'))
      .and(column3.equal('z1'))
      .or(column3.equal('z2'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) AND col3 = 'z1' OR col3 = 'z2'")
  })
})
