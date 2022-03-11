import {
  Builder,
  ColumnNotFoundError,
  e,
  LogicalOperator,
  Table,
  TableNotFoundError,
  TextColumn,
  InvalidExpressionError,
  ArithmeticOperator,
  ComparisonOperator,
  TextOperator,
  ASTERISK,
} from '../src'
import { database } from './database'

//Alias
const AND = LogicalOperator.AND
const OR = LogicalOperator.OR
const ADD = ArithmeticOperator.ADD
const SUB = ArithmeticOperator.SUB
const MUL = ArithmeticOperator.MUL
const DIV = ArithmeticOperator.DIV
const MOD = ArithmeticOperator.MOD
const EXP = ArithmeticOperator.EXP
const CONCAT = TextOperator.CONCAT
const GT = ComparisonOperator.GreaterThan
const table = database.s.public.t.testTable
const column1 = database.s.public.t.testTable.c.column1
const column2 = database.s.public.t.testTable.c.column2
const column3 = database.s.public.t.testTable.c.column3
const column4 = database.s.public.t.testTable.c.column4
const column5 = database.s.public.t.testTable.c.column5
const column6 = database.s.public.t.testTable.c.column6
const column7 = database.s.public.t.testTable.c.column7
const column8 = database.s.public.t.testTable.c.column8

describe('test from one table', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })

  /* In Postgres it is ok to have FROM directly after SELECT */
  it('Produces [SELECT FROM "testTable";]', () => {
    const actual = sql
      .select()
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT FROM "testTable";')
  })

  it('Produces [SELECT "col1" FROM "testTable";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable";')
  })

  it('Produces [SELECT "col1" AS "C1" FROM "testTable";]', () => {
    const actual = sql
      .select(column1.as('C1'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" AS "C1" FROM "testTable";')
  })

  it('Produces [SELECT "col1" AS "C""1" FROM "testTable";] (escape double quote)', () => {
    const actual = sql
      .select(column1.as('C"1'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" AS "C""1" FROM "testTable";')
  })

  it('Produces [SELECT * FROM "testTable";]', () => {
    const actual = sql
      .select(ASTERISK)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable";')
  })

  it('Produces [SELECT * FROM "testTable";] using selectAsteriskFrom()', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "testTable";')
  })

  it('Produces [SELECT 1 FROM "testTable";]', () => {
    const actual = sql
      .select(e(1))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT 1 FROM "testTable";')
  })

  it('Produces [SELECT 1 AS "One" FROM "testTable";]', () => {
    const actual = sql
      .select(e(1).as('One'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT 1 AS "One" FROM "testTable";')
  })

  it('Produces [SELECT \'a\' FROM "testTable";]', () => {
    const actual = sql
      .select(e('a'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT \'a\' FROM "testTable";')
  })

  it('Produces [SELECT *, NULL, \'a\', \'*\', 1, TRUE, FALSE, -5, 3.14 FROM "testTable";]', () => {
    const actual = sql
      .select(ASTERISK, null, 'a', '*', 1, true, false, -5, 3.14)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT *, NULL, \'a\', \'*\', 1, TRUE, FALSE, -5, 3.14 FROM "testTable";')
  })

  it('Produces [SELECT (\'a\' || \'b\') FROM "testTable";]', () => {
    const actual = sql
      .select(e('a', CONCAT, 'b'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT (\'a\' || \'b\') FROM "testTable";')
  })

  it('Produces [SELECT (1 + (2 - 3)) FROM "testTable";]', () => {
    const actual = sql
      .select(e(1, ADD, e(2, SUB, 3)))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT (1 + (2 - 3)) FROM "testTable";')
  })

  it('Produces [SELECT (1 + (2 - 3)) AS "Calc" FROM "testTable";]', () => {
    const actual = sql
      .select(e(1, ADD, e(2, SUB, 3)).as('Calc'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT (1 + (2 - 3)) AS "Calc" FROM "testTable";')
  })

  describe('select literal values', () => {
    it('Produces [SELECT TRUE;]', () => {
      const actual = sql.select(e(true)).getSQL()
      expect(actual).toEqual('SELECT TRUE;')
    })

    it('Produces [SELECT FALSE;]', () => {
      const actual = sql.select(e(false)).getSQL()
      expect(actual).toEqual('SELECT FALSE;')
    })

    it('Produces [SELECT \'A\';]', () => {
      const actual = sql.select(e('A')).getSQL()
      expect(actual).toEqual('SELECT \'A\';')
    })

    it('Produces [SELECT -1;]', () => {
      const actual = sql.select(e(-1)).getSQL()
      expect(actual).toEqual('SELECT -1;')
    })
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable";]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable";')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\';]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\';')
  })

  it('Produces [SELECT "col1" AS "C1", "col2" AS "C2" FROM "testTable" WHERE "col1" = \'x\';]', () => {
    const actual = sql
      .select(column1.as('C1'), column2.as('C2'))
      .from(table)
      .where(column1.eq('x'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" AS "C1", "col2" AS "C2" FROM "testTable" WHERE "col1" = \'x\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" <> \'x\';]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.ne('x'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE "col1" <> \'x\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" = $1;]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq$('x'))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col2" FROM "testTable" WHERE "col1" = $1;',
      values: ['x'],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" <> $1;]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.ne$('x'))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col2" FROM "testTable" WHERE "col1" <> $1;',
      values: ['x'],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col4" = 5;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.eq(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "testTable" WHERE "col4" = 5;')
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col4" = $1;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.eq$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "testTable" WHERE "col4" = $1;',
      values: [5],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col4" <> 5;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.ne(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "testTable" WHERE "col4" <> 5;')
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col4" <> $1;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.ne$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "testTable" WHERE "col4" <> $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS NULL;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.eq(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS NULL;')
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS NOT NULL;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.ne(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS NOT NULL;')
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS NOT $1;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.ne$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS NOT $1;',
      values: [null],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col1" IS NULL;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column1.eq(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "testTable" WHERE "col1" IS NULL;')
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col1" IS NOT NULL;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column1.ne(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "testTable" WHERE "col1" IS NOT NULL;')
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS $1;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.eq$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS NOT $1;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column4.ne$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "testTable" WHERE "col4" IS NOT $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "testTable" WHERE "col1" IS $1;]', () => {
    const actual = sql
      .select(column1, column4)
      .from(table)
      .where(column1.eq$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "testTable" WHERE "col1" IS $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' AND "col2" = \'y\' );]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' AND "col2" = \'y\' );')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = $1 AND "col2" = $2 );]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq$('x'), AND, column2.eq$('y'))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = $1 AND "col2" = $2 );',
      values: ['x', 'y'],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' OR "col2" = \'y\' );]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), OR, column2.eq('y'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' OR "col2" = \'y\' );')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\' AND "col2" = \'y\';]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .and(column2.eq('y'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\' AND "col2" = \'y\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' OR "col2" = \'y\' ) AND "col3" = \'z\';]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), OR, column2.eq('y'))
      .and(column3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' OR "col2" = \'y\' ) AND "col3" = \'z\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\' OR "col2" = \'y\';]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .or(column2.eq('y'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\' OR "col2" = \'y\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' AND "col2" = \'y\' ) OR "col3" = \'z\';]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .or(column3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' AND "col2" = \'y\' ) OR "col3" = \'z\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' AND "col2" = \'y\' ) AND "col3" = \'z1\' OR "col3" = \'z2\';]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'))
      .and(column3.eq('z1'))
      .or(column3.eq('z2'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE ( "col1" = \'x\' AND "col2" = \'y\' ) AND "col3" = \'z1\' OR "col3" = \'z2\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\' AND "col2" = \'y\' AND "col3" = \'z\';]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .and(column2.eq('y'))
      .and(column3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\' AND "col2" = \'y\' AND "col3" = \'z\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\' OR "col2" = \'y\' OR "col3" = \'z\';]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x'))
      .or(column2.eq('y'))
      .or(column3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x\' OR "col2" = \'y\' OR "col3" = \'z\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x1  x2\' AND ( "col2" = \'y\' OR "col3" = \'z\' );]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x1  x2'))
      .and(column2.eq('y'), OR, column3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x1  x2\' AND ( "col2" = \'y\' OR "col3" = \'z\' );')
  })

  it('Produces [SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x1  x2\' OR ( "col2" = \'y\' AND "col3" = \'z\' );]', () => {
    const actual = sql
      .select(column1, column2)
      .from(table)
      .where(column1.eq('x1  x2'))
      .or(column2.eq('y'), AND, column3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "testTable" WHERE "col1" = \'x1  x2\' OR ( "col2" = \'y\' AND "col3" = \'z\' );')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE ( "col1" = \'x\' AND "col2" = \'y\' OR "col4" = 5 );]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq('x'), AND, column2.eq('y'), OR, column4.eq(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE ( "col1" = \'x\' AND "col2" = \'y\' OR "col4" = 5 );')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col1" = \'x\' AND ( "col2" = \'y\' OR "col3" = \'z\' OR "col4" = 5 );]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq('x'))
      .and(column2.eq('y'), OR, column3.eq('z'), OR, column4.eq(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col1" = \'x\' AND ( "col2" = \'y\' OR "col3" = \'z\' OR "col4" = 5 );')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col1" = \'x\' OR ( "col2" = \'y\' AND "col3" = \'z\' AND "col4" = 5 );]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq('x'))
      .or(column2.eq('y'), AND, column3.eq('z'), AND, column4.eq(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col1" = \'x\' OR ( "col2" = \'y\' AND "col3" = \'z\' AND "col4" = 5 );')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col1" = $1 OR ( "col2" = $2 AND "col3" = $3 AND "col4" = $4 );]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq$('x'))
      .or(column2.eq$('y'), AND, column3.eq$('z'), AND, column4.eq$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "testTable" WHERE "col1" = $1 OR ( "col2" = $2 AND "col3" = $3 AND "col4" = $4 );',
      values: ['x', 'y', 'z', 5],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" > 5;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.gt(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" > 5;')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" > $1;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.gt$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "testTable" WHERE "col4" > $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" < 5;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.lt(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" < 5;')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" < $1;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.lt$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "testTable" WHERE "col4" < $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" >= 5;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.ge(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" >= 5;')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" >= $1;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.ge$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "testTable" WHERE "col4" >= $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" <= 5;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.le(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" <= 5;')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" <= $1;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.le$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "testTable" WHERE "col4" <= $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col1" = "col2";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq(column2))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col1" = "col2";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" + "col6");]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, ADD, column6))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" + "col6");')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" - "col6");]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, SUB, column6))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" - "col6");')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" - 1);]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, SUB, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" - 1);')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" * 1);]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, MUL, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" * 1);')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" / 1);]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, DIV, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" / 1);')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" % 1);]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, MOD, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" % 1);')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" ^ 1);]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5, EXP, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = ("col5" ^ 1);')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = (1 + "col5");]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(1, ADD, column5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = (1 + "col5");')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = (1 + 1);]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(1, ADD, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = (1 + 1);')
  })

  describe('Throw desired Errors', () => {
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
      const wrongTable = new Table({
        name: 'wrongTable',
        columns: { anyColumn: new TextColumn({ name: 'anyColumn' }) },
      })

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
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" > "col5";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.gt(column5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" > "col5";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE ("col7" > \'tru\');]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(e(column7, GT, 'tru'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE ("col7" > \'tru\');')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col4" = "col5";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column4.eq(column5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col4" = "col5";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col2" = \'value contain single quote \'\' and more \'\'\'\' , \'\'\';]', () => {
    const stringContainSingleQuote = 'value contain single quote \' and more \'\' , \''
    const actual = sql
      .select(column1)
      .from(table)
      .where(column2.eq(stringContainSingleQuote))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col2" = \'value contain single quote \'\' and more \'\'\'\' , \'\'\';')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" = TRUE;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq(true))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col7" = TRUE;')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" <> TRUE;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.ne(true))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col7" <> TRUE;')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" = $1;] for [$1=true]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq$(true))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "testTable" WHERE "col7" = $1;',
      values: [true],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" <> $1;] for [$1=true]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.ne$(true))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "testTable" WHERE "col7" <> $1;',
      values: [true],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" IS $1;] for [$1=null]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "testTable" WHERE "col7" IS $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" IS NOT $1;] for [$1=null]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.ne$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "testTable" WHERE "col7" IS NOT $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col7";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE NOT "col7";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.not())
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE NOT "col7";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE (NOT "col7" OR NOT "col8");]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.not(), OR, column8.not())
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE ( NOT "col7" OR NOT "col8" );')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE NOT "col7" AND NOT "col8";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.not())
      .and(column8.not())
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE NOT "col7" AND NOT "col8";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" = FALSE;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq(false))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col7" = FALSE;')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" = "col8";]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq(column8))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col7" = "col8";')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" IS NULL;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.eq(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col7" IS NULL;')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col7" IS NOT NULL;]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column7.ne(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col7" IS NOT NULL;')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col1" = ("col2" || "col3");]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq(column2.concat(column3)))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col1" = ("col2" || "col3");')
  })

  it('Produces [SELECT "col1" FROM "testTable" WHERE "col1" = ("col2" || \'something\');]', () => {
    const actual = sql
      .select(column1)
      .from(table)
      .where(column1.eq(column2.concat('something')))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "testTable" WHERE "col1" = ("col2" || \'something\');')
  })
})
