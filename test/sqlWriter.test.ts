import {
  Builder,
  BooleanColumn,
  ColumnNotFoundError,
  Database,
  e,
  LogicalOperator,
  NumberColumn,
  Table,
  TableNotFoundError,
  TextColumn,
  InvalidExpressionError,
} from '../src'
import {
  ArithmeticOperator,
  BooleanOperator,
  TextOperator
} from '../src/models'

//Alias
const AND = LogicalOperator.AND
const OR = LogicalOperator.OR
const ADD = ArithmeticOperator.ADD
const SUB = ArithmeticOperator.SUB
const CONCAT = TextOperator.CONCAT
const GT = BooleanOperator.GreaterThan

describe('test from one table', () => {
  // database schema
  const column1 = new TextColumn('col1')
  const column2 = new TextColumn('col2')
  const column3 = new TextColumn('col3')
  const column4 = new NumberColumn('col4')
  const column5 = new NumberColumn('col5')
  const column6 = new NumberColumn('col6')
  const column7 = new BooleanColumn('col7')
  const column8 = new BooleanColumn('col8')
  const table = new Table(
    'testTable',
    [column1, column2, column3, column4, column5, column6, column7, column8],
  )
  const db = new Database([table], 1)
  const sql = new Builder(db)

  it('Produces [SELECT col1 FROM testTable]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable')
  })

  it('Produces [SELECT 1 FROM testTable]', () => {
    const actual = sql
      .select(e(1))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT 1 FROM testTable')
  })

  it("Produces [SELECT 'a' FROM testTable]", () => {
    const actual = sql
      .select(e('a'))
      .from(table)
      .getSQL()

    expect(actual).toEqual("SELECT 'a' FROM testTable")
  })

  it("Produces [SELECT 'a', 1, TRUE FROM testTableR]", () => {
    const actual = sql
      .select('a', 1, true)
      .from(table)
      .getSQL()

    expect(actual).toEqual("SELECT 'a', 1, TRUE FROM testTable")
  })

  it("Produces [SELECT ('a' || 'b') FROM testTable]", () => {
    const actual = sql
      .select(e('a', CONCAT, 'b'))
      .from(table)
      .getSQL()

    expect(actual).toEqual("SELECT ('a' || 'b') FROM testTable")
  })

  it('Produces [SELECT (1 + (2 - 3)) FROM testTable]', () => {
    const actual = sql
      .select(e(1, ADD, e(2, SUB, 3)))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT (1 + (2 - 3)) FROM testTable')
  })

  describe('select literal values', () => {
    it('Produces [SELECT TRUE]', () => {
      const actual = sql.select(e(true)).getSQL()
      expect(actual).toEqual('SELECT TRUE')
    })

  })

  it('Produces [SELECT col1, col2 FROM testTable]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT col1, col2 FROM testTable')
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x']", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x'")
  })

  it('Produces [SELECT col1, col2 FROM testTable WHERE col1 = $1]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq$('x'))
      .getPostgresqlBinding()

    const expected = {
      sql: 'SELECT col1, col2 FROM testTable WHERE col1 = $1',
      values: ['x'],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT col1, col4 FROM testTable WHERE col4 = 5]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.eq(5))
      .getSQL()

    expect(actual).toEqual('SELECT col1, col4 FROM testTable WHERE col4 = 5')
  })

  it('Produces [SELECT col1, col4 FROM testTable WHERE col4 = $1]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.eq$(5))
      .getPostgresqlBinding()

    const expected = {
      sql: 'SELECT col1, col4 FROM testTable WHERE col4 = $1',
      values: [5],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT col1, col4 FROM testTable WHERE col4 IS NULL]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.eq(null))
      .getSQL()

    expect(actual).toEqual('SELECT col1, col4 FROM testTable WHERE col4 IS NULL')
  })

  it('Produces [SELECT col1, col4 FROM testTable WHERE col1 IS NULL]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column1.eq(null))
      .getSQL()

    expect(actual).toEqual('SELECT col1, col4 FROM testTable WHERE col1 IS NULL')
  })

  it('Produces [SELECT col1, col4 FROM testTable WHERE col4 IS $1]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.eq$(null))
      .getPostgresqlBinding()

    const expected = {
      sql: 'SELECT col1, col4 FROM testTable WHERE col4 IS $1',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT col1, col4 FROM testTable WHERE col1 IS $1]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column1.eq$(null))
      .getPostgresqlBinding()

    const expected = {
      sql: 'SELECT col1, col4 FROM testTable WHERE col1 IS $1',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' )]", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' )")
  })

  it('Produces [SELECT col1, col2 FROM testTable WHERE ( col1 = $1 AND col2 = $2 )]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq$('x'), AND, column2.eq$('y'))
      .getPostgresqlBinding()

    const expected = {
      sql: 'SELECT col1, col2 FROM testTable WHERE ( col1 = $1 AND col2 = $2 )',
      values: ['x', 'y'],
    }

    expect(actual).toEqual(expected)
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' )]", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), OR, column2.eq('y'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' )")
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x' AND col2 = 'y']", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .and(column2.eq('y'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x' AND col2 = 'y'")
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' ) AND col3 = 'z']", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), OR, column2.eq('y'))
      .and(column3.eq('z'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' OR col2 = 'y' ) AND col3 = 'z'")
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x' OR col2 = 'y']", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .or(column2.eq('y'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x' OR col2 = 'y'")
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) OR col3 = 'z']", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .or(column3.eq('z'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) OR col3 = 'z'")
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) AND col3 = 'z1' OR col3 = 'z2']", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .and(column3.eq('z1'))
      .or(column3.eq('z2'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' ) AND col3 = 'z1' OR col3 = 'z2'")
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' AND ( col2 = 'y' OR col3 = 'z' )]", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x1  x2'))
      .and(column2.eq('y'), OR, column3.eq('z'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' AND ( col2 = 'y' OR col3 = 'z' )")
  })

  it("Produces [SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' OR ( col2 = 'y' AND col3 = 'z' )]", () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x1  x2'))
      .or(column2.eq('y'), AND, column3.eq('z'))
      .getSQL()

    expect(actual).toEqual("SELECT col1, col2 FROM testTable WHERE col1 = 'x1  x2' OR ( col2 = 'y' AND col3 = 'z' )")
  })

  it("Produces [SELECT col1 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' OR col4 = 5 )]", () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'), OR, column4.eq(5))
      .getSQL()

    expect(actual).toEqual("SELECT col1 FROM testTable WHERE ( col1 = 'x' AND col2 = 'y' OR col4 = 5 )")
  })

  it("Produces [SELECT col1 FROM testTable WHERE col1 = 'x' AND ( col2 = 'y' OR col3 = 'z' OR col4 = 5 )]", () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq('x'))
      .and(column2.eq('y'), OR, column3.eq('z'), OR, column4.eq(5))
      .getSQL()

    expect(actual).toEqual("SELECT col1 FROM testTable WHERE col1 = 'x' AND ( col2 = 'y' OR col3 = 'z' OR col4 = 5 )")
  })

  it("Produces [SELECT col1 FROM testTable WHERE col1 = 'x' OR ( col2 = 'y' AND col3 = 'z' AND col4 = 5 )]", () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq('x'))
      .or(column2.eq('y'), AND, column3.eq('z'), AND, column4.eq(5))
      .getSQL()

    expect(actual).toEqual("SELECT col1 FROM testTable WHERE col1 = 'x' OR ( col2 = 'y' AND col3 = 'z' AND col4 = 5 )")
  })

  it('Produces [SELECT col1 FROM testTable WHERE col1 = $1 OR ( col2 = $2 AND col3 = $3 AND col4 = $4 )]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq$('x'))
      .or(column2.eq$('y'), AND, column3.eq$('z'), AND, column4.eq$(5))
      .getPostgresqlBinding()

    const expected = {
      sql: 'SELECT col1 FROM testTable WHERE col1 = $1 OR ( col2 = $2 AND col3 = $3 AND col4 = $4 )',
      values: ['x', 'y', 'z', 5],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT col1 FROM testTable WHERE col4 > 5]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.gt(5))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col4 > 5')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col4 > $1]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.gt$(5))
      .getPostgresqlBinding()

    const expected = {
      sql: 'SELECT col1 FROM testTable WHERE col4 > $1',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT col1 FROM testTable WHERE col1 = col2]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq(column2))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col1 = col2')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col4 = (col5 + col6)]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, ADD, column6))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col4 = (col5 + col6)')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col4 = (col5 - col6)]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, SUB, column6))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col4 = (col5 - col6)')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col4 = (col5 - 1)]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, SUB, 1))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col4 = (col5 - 1)')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col4 = (1 + col5)]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(1, ADD, column5))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col4 = (1 + col5)')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col4 = (1 + 1)]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(1, ADD, 1))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col4 = (1 + 1)')
  })

  describe('Throw desired Errors', () => {
    it('Throws error when add invalid operator]', () => {
      function actual() {
        sql.select(e(1, GT, 'f'))
      }

      expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator ">"')
      expect(actual).toThrowError(InvalidExpressionError)
    })

    it('Throws error when column not exist', () => {
      const wrongColumn = new TextColumn('wrongColumn')

      function actual() {
        sql.select(column1, wrongColumn, column3)
      }

      expect(actual).toThrowError('Column: wrongColumn not found')
      expect(actual).toThrowError(ColumnNotFoundError)
    })

    it('Throws error when table not exist', () => {
      const wrongTable = new Table('wrongTable', [new TextColumn('anyColumn')])

      function actual() {
        sql.select(column1).from(wrongTable)
      }

      expect(actual).toThrowError('Table: wrongTable not found')
      expect(actual).toThrowError(TableNotFoundError)
    })

    it('Throws error if number added to text', () => {
      function actual() {
        sql.select(e(1, ADD, 'a')).getSQL()
      }

      expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator "+"')
      expect(actual).toThrowError(InvalidExpressionError)
    })
  })

  it('Produces [SELECT col1 FROM testTable WHERE col4 > col5]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.gt(column5))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col4 > col5')
  })

  it("Produces [SELECT col1 FROM testTable WHERE (col7 > 'tru')]", () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(e(column7, GT, 'tru'))
      .getSQL()

    expect(actual).toEqual("SELECT col1 FROM testTable WHERE (col7 > 'tru')")
  })

  it('Produces [SELECT col1 FROM testTable WHERE col4 = col5]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col4 = col5')
  })

  it("Produces [SELECT col1 FROM testTable WHERE col2 = 'value contain single quote '' and more '''' , ''']", () => {
    const stringContainSingleQuote = "value contain single quote ' and more '' , '"
    const actual = sql
      .select(column1)
      .from(table)
      .where(column2.eq(stringContainSingleQuote))
      .getSQL()

    expect(actual).toEqual("SELECT col1 FROM testTable WHERE col2 = 'value contain single quote '' and more '''' , '''")
  })

  it('Produces [SELECT col1 FROM testTable WHERE col7 = TRUE]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq(true))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col7 = TRUE')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col7 = $1] for [$1=true]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq$(true))
      .getPostgresqlBinding()

    const expected = {
      sql: 'SELECT col1 FROM testTable WHERE col7 = $1',
      values: [true],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT col1 FROM testTable WHERE col7 IS $1] for [$1=null]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq$(null))
      .getPostgresqlBinding()

    const expected = {
      sql: 'SELECT col1 FROM testTable WHERE col7 IS $1',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT col1 FROM testTable WHERE col7]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7)
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col7')
  })

  it('Produces [SELECT col1 FROM testTable WHERE NOT col7]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.not())
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE NOT col7')
  })

  it('Produces [SELECT col1 FROM testTable WHERE (NOT col7 OR NOT col8)]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.not(), OR, column8.not())
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE ( NOT col7 OR NOT col8 )')
  })

  it('Produces [SELECT col1 FROM testTable WHERE NOT col7 AND NOT col8]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.not())
      .and(column8.not())
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE NOT col7 AND NOT col8')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col7 = FALSE]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq(false))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col7 = FALSE')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col7 = col8]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq(column8))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col7 = col8')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col7 IS NULL]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq(null))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col7 IS NULL')
  })

  it('Produces [SELECT col1 FROM testTable WHERE col1 = (col2 || col3)]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq(column2.concat(column3)))
      .getSQL()

    expect(actual).toEqual('SELECT col1 FROM testTable WHERE col1 = (col2 || col3)')
  })

  it("Produces [SELECT col1 FROM testTable WHERE col1 = (col2 || 'something')]", () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq(column2.concat('something')))
      .getSQL()

    expect(actual).toEqual("SELECT col1 FROM testTable WHERE col1 = (col2 || 'something')")
  })
})
