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

  //regex to replace multi white space with one ignore singel quoted text
  //TODO: enhance it to cover the case when there is escape quote "\'"
  const whiteSpaceRegex = /\s+(?=(?:'[^']*'|[^'])*$)/g

  it('produces [SELECT col1 FROM testTable]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
      .trim()

    expect(received).toEqual('SELECT col1 FROM testTable')
  })

  it('produces [SELECT col1, col2 FROM testTable]', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
      .trim()

    expect(received).toEqual('SELECT col1, col2 FROM testTable')
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x'")
  })

  it('produces [SELECT col1, col4 FROM testTable WHERE col4 = 5]', () => {
    const received = asql
      .select(column1, column4)
      .from(table)
      .where(column4.eq(5))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual('SELECT col1, col4 FROM testTable WHERE col4 = 5')
  })

  it('produces [SELECT col1, col4 FROM testTable WHERE col4 IS NULL]', () => {
    const received = asql
      .select(column1, column4)
      .from(table)
      .where(column4.eq(null))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual('SELECT col1, col4 FROM testTable WHERE col4 IS NULL')
  })

  it('produces [SELECT col1, col4 FROM testTable WHERE col1 IS NULL]', () => {
    const received = asql
      .select(column1, column4)
      .from(table)
      .where(column1.eq(null))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual('SELECT col1, col4 FROM testTable WHERE col1 IS NULL')
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' )]", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' )")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' )]", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), OR, column2.eq('y'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' )")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x' AND col2 = 'y']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .and(column2.eq('y'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x' AND col2 = 'y'")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' ) AND col3 = 'z']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), OR, column2.eq('y'))
      .and(column3.eq('z'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' ) AND col3 = 'z'")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x' OR col2 = 'y']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .or(column2.eq('y'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x' OR col2 = 'y'")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) OR col3 = 'z']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .or(column3.eq('z'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) OR col3 = 'z'")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) AND col3 = 'z1' OR col3 = 'z2']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .and(column3.eq('z1'))
      .or(column3.eq('z2'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) AND col3 = 'z1' OR col3 = 'z2'")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' AND ( col2 = 'y' OR col3 = 'z' )]", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x1  x2'))
      .and(column2.eq('y'), OR, column3.eq('z'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' AND ( col2 = 'y' OR col3 = 'z' )")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' OR ( col2 = 'y' AND col3 = 'z' )]", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x1  x2'))
      .or(column2.eq('y'), AND, column3.eq('z'))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' OR ( col2 = 'y' AND col3 = 'z' )")
  })

  it("produces [SELECT col1 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' OR col4 = 5 )]", () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'), OR, column4.eq(5))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' OR col4 = 5 )")
  })

  it("produces [SELECT col1 FROM testTable WHERE col1 = 'x' AND ( col2 = 'y' OR col3 = 'z' OR col4 = 5 )]", () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column1.eq('x'))
      .and(column2.eq('y'), OR, column3.eq('z'), OR, column4.eq(5))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1 FROM testTable WHERE col1 = 'x' AND ( col2 = 'y' OR col3 = 'z' OR col4 = 5 )")
  })

  it("produces [SELECT col1 FROM testTable WHERE col1 = 'x' OR ( col2 = 'y' AND col3 = 'z' AND col4 = 5 )]", () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column1.eq('x'))
      .or(column2.eq('y'), AND, column3.eq('z'), AND, column4.eq(5))
      .getSQL()
      .replace(whiteSpaceRegex, ' ')
    expect(received).toEqual("SELECT col1 FROM testTable WHERE col1 = 'x' OR ( col2 = 'y' AND col3 = 'z' AND col4 = 5 )")
  })
})
