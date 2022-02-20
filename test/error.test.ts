import {
  Builder,
  ColumnNotFoundError,
  e,
  Table,
  TableNotFoundError,
  TextColumn,
  InvalidExpressionError,
  ArithmeticOperator,
  ComparisonOperator,
  DISTINCT,
  ASC,
  DESC,
  NULLS_FIRST,
  NULLS_LAST,
} from '../src'
import {
  database,
  table,
  column1,
  column3,
} from './database'

//Alias
const ADD = ArithmeticOperator.ADD
const GT = ComparisonOperator.GreaterThan

describe('Throw desired Errors', () => {
  const sql = new Builder(database)

  it('Throws error when add invalid operator', () => {
    function actual() {
      sql.select(e(1, GT, 'f'))
    }

    expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator ">"')
    expect(actual).toThrowError(InvalidExpressionError)
  })

  it('Throws error when column not exist', () => {
    const wrongColumn = new TextColumn({ name: 'wrongColumn' })

    function actual() {
      sql.select(column1, wrongColumn, column3)
    }

    expect(actual).toThrowError('Column: "wrongColumn" not found')
    expect(actual).toThrowError(ColumnNotFoundError)
  })

  it('Throws error when table not exist', () => {
    const wrongTable = new Table({ tableName: 'wrongTable', columns: [new TextColumn({ name: 'anyColumn' })] })

    function actual() {
      sql.select(column1).from(wrongTable)
    }

    expect(actual).toThrowError('Table: "wrongTable" not found')
    expect(actual).toThrowError(TableNotFoundError)
  })

  it('Throws error if number added to text', () => {
    function actual() {
      sql.select(e(1, ADD, 'a')).getSQL()
    }

    expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator "+"')
    expect(actual).toThrowError(InvalidExpressionError)
  })

  it('Throws error when no param to select passed after DISTINCT', () => {
    function actual() {
      sql.select(DISTINCT).from(table)
    }

    expect(actual).toThrow(/^Select step must have at least one parameter after DISTINCT$/)
  })

  it('Throws error when ORDER BY has no param', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy()
    }

    expect(actual).toThrow(/^Order by should have at lease one item$/)
  })

  it('Throws error when DESC comes before alias or column', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(DESC, 'column1')
    }

    expect(actual).toThrow(/^ DESC expects to have column or alias before it$/)
  })

  it('Throws error when NULLS FIRST comes before alias or column', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(NULLS_FIRST, column1)
    }

    expect(actual).toThrow(/^ NULLS FIRST expects to have column or alias before it$/)
  })

  it('Throws error when DESC come before column or alias name', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(column1, NULLS_FIRST, DESC)
    }

    expect(actual).toThrow(/^ DESC expects to have column or alias before it$/)
  })

  it('Throws error when NULLS_LAST comes directly after NULLS_FIRST', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(column1, NULLS_FIRST, NULLS_LAST)
    }

    expect(actual).toThrow(/^ NULLS LAST expects to have column or alias before it$/)
  })

  it('Throws error when DESC comes directly after ASC', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(column1, ASC, DESC)
    }

    expect(actual).toThrow(/^ DESC shouldn't come after "ASC" or "DESC" without column or alias in between$/)
  })

  it('Throws error when LIMIT step has negative number', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .limit(-1)
    }

    expect(actual).toThrow(/^Invalid limit value -1, negative numbers are not allowed$/)
  })

  it('Throws error when OFFSET step has negative number', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .offset(-1)
    }

    expect(actual).toThrow(/^Invalid offset value -1, negative numbers are not allowed$/)
  })
})
