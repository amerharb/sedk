import {
  InvalidExpressionError,
  ColumnNotFoundError,
  TableNotFoundError,
  MoreThanOneDistinctOrAllError,
  Builder,
  e,
  Table,
  TextColumn,
  ArithmeticOperator,
  ComparisonOperator,
  DISTINCT,
  ALL,
  ASC,
  DESC,
  NULLS_FIRST,
  NULLS_LAST, f,
} from '../src'
import { database } from './database'

//Alias
const ADD = ArithmeticOperator.ADD
const GT = ComparisonOperator.GreaterThan
const table = database.s.public.t.table1
const col1 = database.s.public.t.table1.c.col1
const col3 = database.s.public.t.table1.c.col3

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
      sql.select(col1, wrongColumn, col3)
    }

    expect(actual).toThrowError('Column: "wrongColumn" not found')
    expect(actual).toThrowError(ColumnNotFoundError)
  })

  it('Throws error when table not exist', () => {
    const wrongTable = new Table({ name: 'wrongTable', columns: { anyColumn: new TextColumn({ name: 'anyColumn' }) } })

    function actual() {
      sql.select(col1).from(wrongTable)
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

  it('Throws error when more than one DISTINCT passed', () => {
    function actual() {
      // @ts-ignore
      sql.select(DISTINCT, DISTINCT, col1).from(table)
    }

    expect(actual).toThrow(/^You can not have more than one DISTINCT or ALL$/)
    expect(actual).toThrow(MoreThanOneDistinctOrAllError)
  })

  it('Throws error when more than one ALL passed', () => {
    function actual() {
      // @ts-ignore
      sql.select(ALL, ALL, col1).from(table)
    }

    expect(actual).toThrow(/^You can not have more than one DISTINCT or ALL$/)
    expect(actual).toThrow(MoreThanOneDistinctOrAllError)
  })

  it('Throws error when DISTINCT and ALL passed', () => {
    // @ts-ignore
    function actual1() { sql.select(ALL, col1, DISTINCT).from(table) }

    // @ts-ignore
    function actual2() { sql.select(ALL, DISTINCT, col1).from(table) }

    // @ts-ignore
    function actual3() { sql.select(DISTINCT, ALL, col1).from(table) }

    // @ts-ignore
    function actual4() { sql.select(DISTINCT, col1, ALL).from(table) }

    [actual1, actual2, actual3, actual4].forEach(actual => {
      expect(actual).toThrow(/^You can not have more than one DISTINCT or ALL$/)
      expect(actual).toThrow(MoreThanOneDistinctOrAllError)
    })
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
        .orderBy(DESC, 'col1')
    }

    expect(actual).toThrow(/^ DESC expects to have column or alias before it$/)
  })

  it('Throws error when NULLS FIRST comes before alias or column', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(NULLS_FIRST, col1)
    }

    expect(actual).toThrow(/^ NULLS FIRST expects to have column or alias before it$/)
  })

  it('Throws error when DESC come before column or alias name', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(col1, NULLS_FIRST, DESC)
    }

    expect(actual).toThrow(/^ DESC expects to have column or alias before it$/)
  })

  it('Throws error when NULLS_LAST comes directly after NULLS_FIRST', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(col1, NULLS_FIRST, NULLS_LAST)
    }

    expect(actual).toThrow(/^ NULLS LAST expects to have column or alias before it$/)
  })

  it('Throws error when DESC comes directly after ASC', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(col1, ASC, DESC)
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

  it('Throws error "Expression Type must be number in aggregate function"', () => {
    function actual() {
      sql
        .select(col1)
        .from(table)
        .groupBy(col1)
        .having(f.sum(e('text')).eq(4))
        .getSQL()
    }

    expect(actual).toThrow(/^Expression Type must be number in aggregate function$/)
  })
})
