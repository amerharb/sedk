import {
  Builder,
  e,
  $,
  LogicalOperator,
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
const table = database.s.public.t.table1
const col1 = database.s.public.t.table1.c.col1
const col2 = database.s.public.t.table1.c.col2
const col3 = database.s.public.t.table1.c.col3
const col4 = database.s.public.t.table1.c.col4
const col5 = database.s.public.t.table1.c.col5
const col6 = database.s.public.t.table1.c.col6
const col7 = database.s.public.t.table1.c.col7
const col8 = database.s.public.t.table1.c.col8

describe('test from one table', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })

  /* In Postgres it is ok to have FROM directly after SELECT */
  it('Produces [SELECT FROM "table1";]', () => {
    const actual = sql
      .select()
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT FROM "table1";')
  })

  it('Produces [SELECT "col1" FROM "table1";]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1";')
  })

  it('Produces [SELECT "col1" AS "C1" FROM "table1";]', () => {
    const actual = sql
      .select(col1.as('C1'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" AS "C1" FROM "table1";')
  })

  it('Produces [SELECT "col1" AS "C""1" FROM "table1";] (escape double quote)', () => {
    const actual = sql
      .select(col1.as('C"1'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" AS "C""1" FROM "table1";')
  })

  it('Produces [SELECT * FROM "table1";]', () => {
    const actual = sql
      .select(ASTERISK)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "table1";')
  })

  it('Produces [SELECT * FROM "table1";] using selectAsteriskFrom()', () => {
    const actual = sql
      .selectAsteriskFrom(table)
      .getSQL()

    expect(actual).toEqual('SELECT * FROM "table1";')
  })

  it('Produces [SELECT 1 FROM "table1";]', () => {
    const actual = sql
      .select(e(1))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT 1 FROM "table1";')
  })

  it('Produces [SELECT (1 + $1) FROM "table1";]', () => {
    const actual = sql
      .select(e(1, ADD, $(5)))
      .from(table)
      .getBinds()

    const expected = {
      sql: 'SELECT (1 + $1) FROM "table1";',
      values: [5],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT $1 FROM "table1";]', () => {
    const actual = sql
      .select($(5))
      .from(table)
      .getBinds()

    const expected = {
      sql: 'SELECT $1 FROM "table1";',
      values: [5],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT $1, $2, $3, $4 FROM "table1";]', () => {
    const actual = sql
      .select($(null), $(true), $(1), $('a'))
      .from(table)
      .getBinds()

    const expected = {
      sql: 'SELECT $1, $2, $3, $4 FROM "table1";',
      values: [null, true, 1, 'a'],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT 1 AS "One" FROM "table1";]', () => {
    const actual = sql
      .select(e(1).as('One'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT 1 AS "One" FROM "table1";')
  })

  it('Produces [SELECT \'a\' FROM "table1";]', () => {
    const actual = sql
      .select(e('a'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT \'a\' FROM "table1";')
  })

  it('Produces [SELECT *, NULL, \'a\', \'*\', 1, TRUE, FALSE, -5, 3.14 FROM "table1";]', () => {
    const actual = sql
      .select(ASTERISK, null, 'a', '*', 1, true, false, -5, 3.14)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT *, NULL, \'a\', \'*\', 1, TRUE, FALSE, -5, 3.14 FROM "table1";')
  })

  it('Produces [SELECT (\'a\' || \'b\') FROM "table1";]', () => {
    const actual = sql
      .select(e('a', CONCAT, 'b'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT (\'a\' || \'b\') FROM "table1";')
  })

  it('Produces [SELECT (1 + (2 - 3)) FROM "table1";]', () => {
    const actual = sql
      .select(e(1, ADD, e(2, SUB, 3)))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT (1 + (2 - 3)) FROM "table1";')
  })

  it('Produces [SELECT (1 + (2 - 3)) AS "Calc" FROM "table1";]', () => {
    const actual = sql
      .select(e(1, ADD, e(2, SUB, 3)).as('Calc'))
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT (1 + (2 - 3)) AS "Calc" FROM "table1";')
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

    it('Produces [SELECT TRUE;] without e() function', () => {
      const actual = sql.select(true).getSQL()
      expect(actual).toEqual('SELECT TRUE;')
    })

    it('Produces [SELECT FALSE;] without e() function', () => {
      const actual = sql.select(false).getSQL()
      expect(actual).toEqual('SELECT FALSE;')
    })

    it('Produces [SELECT \'A\';]', () => {
      const actual = sql.select(e('A')).getSQL()
      expect(actual).toEqual('SELECT \'A\';')
    })

    it('Produces [SELECT \'A\';] without e() function', () => {
      const actual = sql.select('A').getSQL()
      expect(actual).toEqual('SELECT \'A\';')
    })

    it('Produces [SELECT -1;]', () => {
      const actual = sql.select(e(-1)).getSQL()
      expect(actual).toEqual('SELECT -1;')
    })

    it('Produces [SELECT -1;] without e() function', () => {
      const actual = sql.select(-1).getSQL()
      expect(actual).toEqual('SELECT -1;')
    })
  })

  it('Produces [SELECT "col1", "col2" FROM "table1";]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1";')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\';]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\';')
  })

  it('Produces [SELECT "col1" AS "C1", "col2" AS "C2" FROM "table1" WHERE "col1" = \'x\';]', () => {
    const actual = sql
      .select(col1.as('C1'), col2.as('C2'))
      .from(table)
      .where(col1.eq('x'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" AS "C1", "col2" AS "C2" FROM "table1" WHERE "col1" = \'x\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" <> \'x\';]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.ne('x'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE "col1" <> \'x\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" = $1;]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq$('x'))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col2" FROM "table1" WHERE "col1" = $1;',
      values: ['x'],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" <> $1;]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.ne$('x'))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col2" FROM "table1" WHERE "col1" <> $1;',
      values: ['x'],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col4" = 5;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col4.eq(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "table1" WHERE "col4" = 5;')
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col4" = $1;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col4.eq$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "table1" WHERE "col4" = $1;',
      values: [5],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col4" <> 5;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col4.ne(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "table1" WHERE "col4" <> 5;')
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col4" <> $1;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col4.ne$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "table1" WHERE "col4" <> $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col4" IS NULL;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col4.eq(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "table1" WHERE "col4" IS NULL;')
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col4" IS NOT NULL;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col4.ne(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "table1" WHERE "col4" IS NOT NULL;')
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col4" IS NOT $1;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col4.ne$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "table1" WHERE "col4" IS NOT $1;',
      values: [null],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col1" IS NULL;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col1.eq(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "table1" WHERE "col1" IS NULL;')
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col1" IS NOT NULL;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col1.ne(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col4" FROM "table1" WHERE "col1" IS NOT NULL;')
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col4" IS $1;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col4.eq$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "table1" WHERE "col4" IS $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col4" IS NOT $1;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col4.ne$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "table1" WHERE "col4" IS NOT $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col4" FROM "table1" WHERE "col1" IS $1;]', () => {
    const actual = sql
      .select(col1, col4)
      .from(table)
      .where(col1.eq$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col4" FROM "table1" WHERE "col1" IS $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' AND "col2" = \'y\' );]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'), AND, col2.eq('y'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' AND "col2" = \'y\' );')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = $1 AND "col2" = $2 );]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq$('x'), AND, col2.eq$('y'))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = $1 AND "col2" = $2 );',
      values: ['x', 'y'],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' OR "col2" = \'y\' );]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'), OR, col2.eq('y'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' OR "col2" = \'y\' );')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\' AND "col2" = \'y\';]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'))
      .and(col2.eq('y'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\' AND "col2" = \'y\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' OR "col2" = \'y\' ) AND "col3" = \'z\';]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'), OR, col2.eq('y'))
      .and(col3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' OR "col2" = \'y\' ) AND "col3" = \'z\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\' OR "col2" = \'y\';]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'))
      .or(col2.eq('y'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\' OR "col2" = \'y\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' AND "col2" = \'y\' ) OR "col3" = \'z\';]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'), AND, col2.eq('y'))
      .or(col3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' AND "col2" = \'y\' ) OR "col3" = \'z\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' AND "col2" = \'y\' ) AND "col3" = \'z1\' OR "col3" = \'z2\';]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'), AND, col2.eq('y'))
      .and(col3.eq('z1'))
      .or(col3.eq('z2'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE ( "col1" = \'x\' AND "col2" = \'y\' ) AND "col3" = \'z1\' OR "col3" = \'z2\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\' AND "col2" = \'y\' AND "col3" = \'z\';]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'))
      .and(col2.eq('y'))
      .and(col3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\' AND "col2" = \'y\' AND "col3" = \'z\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\' OR "col2" = \'y\' OR "col3" = \'z\';]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x'))
      .or(col2.eq('y'))
      .or(col3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x\' OR "col2" = \'y\' OR "col3" = \'z\';')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x1  x2\' AND ( "col2" = \'y\' OR "col3" = \'z\' );]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x1  x2'))
      .and(col2.eq('y'), OR, col3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x1  x2\' AND ( "col2" = \'y\' OR "col3" = \'z\' );')
  })

  it('Produces [SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x1  x2\' OR ( "col2" = \'y\' AND "col3" = \'z\' );]', () => {
    const actual = sql
      .select(col1, col2)
      .from(table)
      .where(col1.eq('x1  x2'))
      .or(col2.eq('y'), AND, col3.eq('z'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" WHERE "col1" = \'x1  x2\' OR ( "col2" = \'y\' AND "col3" = \'z\' );')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE ( "col1" = \'x\' AND "col2" = \'y\' OR "col4" = 5 );]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col1.eq('x'), AND, col2.eq('y'), OR, col4.eq(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE ( "col1" = \'x\' AND "col2" = \'y\' OR "col4" = 5 );')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col1" = \'x\' AND ( "col2" = \'y\' OR "col3" = \'z\' OR "col4" = 5 );]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col1.eq('x'))
      .and(col2.eq('y'), OR, col3.eq('z'), OR, col4.eq(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col1" = \'x\' AND ( "col2" = \'y\' OR "col3" = \'z\' OR "col4" = 5 );')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col1" = \'x\' OR ( "col2" = \'y\' AND "col3" = \'z\' AND "col4" = 5 );]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col1.eq('x'))
      .or(col2.eq('y'), AND, col3.eq('z'), AND, col4.eq(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col1" = \'x\' OR ( "col2" = \'y\' AND "col3" = \'z\' AND "col4" = 5 );')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col1" = $1 OR ( "col2" = $2 AND "col3" = $3 AND "col4" = $4 );]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col1.eq$('x'))
      .or(col2.eq$('y'), AND, col3.eq$('z'), AND, col4.eq$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "table1" WHERE "col1" = $1 OR ( "col2" = $2 AND "col3" = $3 AND "col4" = $4 );',
      values: ['x', 'y', 'z', 5],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" > 5;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.gt(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" > 5;')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" > $1;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.gt$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "table1" WHERE "col4" > $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" < 5;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.lt(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" < 5;')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" < $1;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.lt$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "table1" WHERE "col4" < $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" >= 5;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.ge(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" >= 5;')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" >= $1;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.ge$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "table1" WHERE "col4" >= $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" <= 5;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.le(5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" <= 5;')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" <= $1;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.le$(5))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "table1" WHERE "col4" <= $1;',
      values: [5],
    }
    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col1" = "col2";]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col1.eq(col2))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col1" = "col2";')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = ("col5" + "col6");]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(col5, ADD, col6))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = ("col5" + "col6");')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = ("col5" - "col6");]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(col5, SUB, col6))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = ("col5" - "col6");')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = ("col5" - 1);]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(col5, SUB, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = ("col5" - 1);')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = ("col5" * 1);]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(col5, MUL, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = ("col5" * 1);')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = ("col5" / 1);]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(col5, DIV, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = ("col5" / 1);')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = ("col5" % 1);]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(col5, MOD, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = ("col5" % 1);')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = ("col5" ^ 1);]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(col5, EXP, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = ("col5" ^ 1);')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = (1 + "col5");]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(1, ADD, col5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = (1 + "col5");')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = (1 + 1);]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(1, ADD, 1))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = (1 + 1);')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" > "col5";]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.gt(col5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" > "col5";')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE ("col7" > \'tru\');]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(e(col7, GT, 'tru'))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE ("col7" > \'tru\');')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col4" = "col5";]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col4.eq(col5))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col4" = "col5";')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col2" = \'value contain single quote \'\' and more \'\'\'\' , \'\'\';]', () => {
    const stringContainSingleQuote = 'value contain single quote \' and more \'\' , \''
    const actual = sql
      .select(col1)
      .from(table)
      .where(col2.eq(stringContainSingleQuote))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col2" = \'value contain single quote \'\' and more \'\'\'\' , \'\'\';')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" = TRUE;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.eq(true))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col7" = TRUE;')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" <> TRUE;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.ne(true))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col7" <> TRUE;')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" = $1;] for [$1=true]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.eq$(true))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "table1" WHERE "col7" = $1;',
      values: [true],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" <> $1;] for [$1=true]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.ne$(true))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "table1" WHERE "col7" <> $1;',
      values: [true],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" IS $1;] for [$1=null]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.eq$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "table1" WHERE "col7" IS $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" IS NOT $1;] for [$1=null]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.ne$(null))
      .getBinds()

    const expected = {
      sql: 'SELECT "col1" FROM "table1" WHERE "col7" IS NOT $1;',
      values: [null],
    }

    expect(actual).toEqual(expected)
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7";]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7)
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col7";')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE NOT "col7";]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.not())
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE NOT "col7";')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE (NOT "col7" OR NOT "col8");]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.not(), OR, col8.not())
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE ( NOT "col7" OR NOT "col8" );')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE NOT "col7" AND NOT "col8";]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.not())
      .and(col8.not())
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE NOT "col7" AND NOT "col8";')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" = FALSE;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.eq(false))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col7" = FALSE;')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" = "col8";]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.eq(col8))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col7" = "col8";')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" IS NULL;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.eq(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col7" IS NULL;')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col7" IS NOT NULL;]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col7.ne(null))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col7" IS NOT NULL;')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col1" = ("col2" || "col3");]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col1.eq(col2.concat(col3)))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col1" = ("col2" || "col3");')
  })

  it('Produces [SELECT "col1" FROM "table1" WHERE "col1" = ("col2" || \'something\');]', () => {
    const actual = sql
      .select(col1)
      .from(table)
      .where(col1.eq(col2.concat('something')))
      .getSQL()

    expect(actual).toEqual('SELECT "col1" FROM "table1" WHERE "col1" = ("col2" || \'something\');')
  })
})
