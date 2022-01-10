import * as sql from './sqlWriter'
import {Database, NumberColumn, Operator, Table, TextColumn} from './model'
import {ColumnNotFoundError, TableNotFoundError} from './Errors'

//Alias
const AND = sql.LogicalOperator.AND
const OR = sql.LogicalOperator.OR
const ADD = Operator.ADD
const SUB = Operator.SUB

describe('test from one table', () => {
  // database schema
  const column1 = new TextColumn('col1')
  const column2 = new TextColumn('col2')
  const column3 = new TextColumn('col3')
  const column4 = new NumberColumn('col4')
  const column5 = new NumberColumn('col5')
  const column6 = new NumberColumn('col6')
  const table = new Table('testTable', [column1, column2, column3, column4, column5, column6])
  const db = new Database([table], 1)
  const asql = new sql.ASql(db)

  it('produces [SELECT col1 FROM testTable]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable')
  })

  it('produces [SELECT col1, col2 FROM testTable]', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .getSQL()

    expect(received).toEqual('SELECT col1, col2 FROM testTable')
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .getSQL()

    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x'")
  })

  it('produces [SELECT col1, col4 FROM testTable WHERE col4 = 5]', () => {
    const received = asql
      .select(column1, column4)
      .from(table)
      .where(column4.eq(5))
      .getSQL()

    expect(received).toEqual('SELECT col1, col4 FROM testTable WHERE col4 = 5')
  })

  it('produces [SELECT col1, col4 FROM testTable WHERE col4 IS NULL]', () => {
    const received = asql
      .select(column1, column4)
      .from(table)
      .where(column4.eq(null))
      .getSQL()

    expect(received).toEqual('SELECT col1, col4 FROM testTable WHERE col4 IS NULL')
  })

  it('produces [SELECT col1, col4 FROM testTable WHERE col1 IS NULL]', () => {
    const received = asql
      .select(column1, column4)
      .from(table)
      .where(column1.eq(null))
      .getSQL()

    expect(received).toEqual('SELECT col1, col4 FROM testTable WHERE col1 IS NULL')
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' )]", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .getSQL()

    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' )")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' )]", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), OR, column2.eq('y'))
      .getSQL()

    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' )")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x' AND col2 = 'y']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .and(column2.eq('y'))
      .getSQL()

    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x' AND col2 = 'y'")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' ) AND col3 = 'z']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), OR, column2.eq('y'))
      .and(column3.eq('z'))
      .getSQL()

    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' ) AND col3 = 'z'")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x' OR col2 = 'y']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .or(column2.eq('y'))
      .getSQL()

    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x' OR col2 = 'y'")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) OR col3 = 'z']", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .or(column3.eq('z'))
      .getSQL()

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

    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) AND col3 = 'z1' OR col3 = 'z2'")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' AND ( col2 = 'y' OR col3 = 'z' )]", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x1  x2'))
      .and(column2.eq('y'), OR, column3.eq('z'))
      .getSQL()

    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' AND ( col2 = 'y' OR col3 = 'z' )")
  })

  it("produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' OR ( col2 = 'y' AND col3 = 'z' )]", () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x1  x2'))
      .or(column2.eq('y'), AND, column3.eq('z'))
      .getSQL()

    expect(received).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' OR ( col2 = 'y' AND col3 = 'z' )")
  })

  it("produces [SELECT col1 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' OR col4 = 5 )]", () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'), OR, column4.eq(5))
      .getSQL()

    expect(received).toEqual("SELECT col1 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' OR col4 = 5 )")
  })

  it("produces [SELECT col1 FROM testTable WHERE col1 = 'x' AND ( col2 = 'y' OR col3 = 'z' OR col4 = 5 )]", () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column1.eq('x'))
      .and(column2.eq('y'), OR, column3.eq('z'), OR, column4.eq(5))
      .getSQL()

    expect(received).toEqual("SELECT col1 FROM testTable WHERE col1 = 'x' AND ( col2 = 'y' OR col3 = 'z' OR col4 = 5 )")
  })

  it("produces [SELECT col1 FROM testTable WHERE col1 = 'x' OR ( col2 = 'y' AND col3 = 'z' AND col4 = 5 )]", () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column1.eq('x'))
      .or(column2.eq('y'), AND, column3.eq('z'), AND, column4.eq(5))
      .getSQL()

    expect(received).toEqual("SELECT col1 FROM testTable WHERE col1 = 'x' OR ( col2 = 'y' AND col3 = 'z' AND col4 = 5 )")
  })

  it('produces [SELECT col1 FROM testTable WHERE col4 > 5]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column4.gt(5))
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable WHERE col4 > 5')
  })

  it('produces [SELECT col1 FROM testTable WHERE col1 = col2]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column1.eq(column2))
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable WHERE col1 = col2')
  })

  it('produces [SELECT col1 FROM testTable WHERE col4 = col5 + col6]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, ADD, column6))
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable WHERE col4 = col5 + col6')
  })

  it('produces [SELECT col1 FROM testTable WHERE col4 = col5 - col6]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, SUB, column6))
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable WHERE col4 = col5 - col6')
  })

  it('produces [SELECT col1 FROM testTable WHERE col4 = col5 - 1]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, SUB, 1))
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable WHERE col4 = col5 - 1')
  })

  it('produces [SELECT col1 FROM testTable WHERE col4 = 1 + col5]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column4.eq(1, ADD, column5))
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable WHERE col4 = 1 + col5')
  })

  it('produces [SELECT col1 FROM testTable WHERE col4 = 1 + 1]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column4.eq(1, ADD, 1))
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable WHERE col4 = 1 + 1')
  })

  it('throw error when add invalid operator]', () => {
    try {
      asql
        .select(column1)
        .from(table)
        .where(column4.eq(1, Operator.Equal, 1))
        .getSQL()

    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(err).toMatchObject(new Error('Function "getResultExpressionType" does not support operator: "="'))
    }
  })

  it('produces [SELECT col1 FROM testTable WHERE col4 > col5]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column4.gt(column5))
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable WHERE col4 > col5')
  })

  it('produces [SELECT col1 FROM testTable WHERE col4 = col5]', () => {
    const received = asql
      .select(column1)
      .from(table)
      .where(column4.eq(column5))
      .getSQL()

    expect(received).toEqual('SELECT col1 FROM testTable WHERE col4 = col5')
  })

  it("produces [SELECT col1 FROM testTable WHERE col2 = 'value contain single quote '' and more '''' , ''']", () => {
    const stringContainSingleQuote = "value contain single quote ' and more '' , '"
    const received = asql
      .select(column1)
      .from(table)
      .where(column2.eq(stringContainSingleQuote))
      .getSQL()

    expect(received).toEqual("SELECT col1 FROM testTable WHERE col2 = 'value contain single quote '' and more '''' , '''")
  })

  it('Throw error when column not exist', () => {
    const wrongColumn = new TextColumn('wrongColumn')
    try {
      asql
        .select(column1, wrongColumn, column3)
        .from(table)
        .getSQL()

    } catch (err) {
      expect(err).toBeInstanceOf(ColumnNotFoundError)
      expect(err).toMatchObject(new ColumnNotFoundError('Column: wrongColumn not found'))
    }
  })

  it('Throw error when table not exist', () => {
    const wrongTable = new Table('wrongTable', [new TextColumn('anyColumn')])
    try {
      asql
        .select(column1)
        .from(wrongTable)
        .getSQL()
    } catch (err) {
      expect(err).toBeInstanceOf(TableNotFoundError)
      expect(err).toMatchObject(new ColumnNotFoundError('Table: wrongTable not found'))
    }
  })
})
