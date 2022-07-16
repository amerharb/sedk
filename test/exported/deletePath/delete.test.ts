import * as sedk from '../../../src'
import { database } from '../../database'

//Alias
const AND = sedk.LogicalOperator.AND
const OR = sedk.LogicalOperator.OR
const ASTERISK = sedk.ASTERISK
const table1 = database.s.public.t.table1
const table2 = database.s.public.t.table2


describe('DELETE Path', () => {
  const sql = new sedk.Builder(database, { throwErrorIfDeleteHasNoCondition: false })
  afterEach(() => { sql.cleanUp() })
  describe('Basic delete all', () => {
    it('Produces [DELETE FROM "table1"]', () => {
      const actual = sql.deleteFrom(table1).getSQL()
      expect(actual).toEqual('DELETE FROM "table1";')
    })
    it('Produces [DELETE FROM "table2"]', () => {
      const actual = sql.delete().from(table2).getSQL()
      expect(actual).toEqual('DELETE FROM "table2";')
    })
    it('Produces [DELETE FROM "table1" AS "t1"]', () => {
      const actual = sql.delete().from(table1.as('t1')).getSQL()
      expect(actual).toEqual('DELETE FROM "table1" AS "t1";')
    })
    it('Produces [DELETE FROM "table2" AS "t2"]', () => {
      const actual = sql.deleteFrom(table2.as('t2')).getSQL()
      expect(actual).toEqual('DELETE FROM "table2" AS "t2";')
    })
  })

  describe('Delete with where', () => {
    it(`Produces [DELETE FROM "table1" WHERE "col1" = 'A';]`, () => {
      const actual = sql.deleteFrom(table1).where(table1.c.col1.eq('A')).getSQL()
      expect(actual).toEqual(`DELETE FROM "table1" WHERE "col1" = 'A';`)
    })
    it(`Produces [DELETE FROM "table1" WHERE ( "col1" = 'A' AND "col2" = 'B' );]`, () => {
      const actual = sql
        .delete()
        .from(table1)
        .where(table1.c.col1.eq('A'), AND, table1.c.col2.eq('B'))
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE ( "col1" = 'A' AND "col2" = 'B' );`)
    })
    it(`Produces [DELETE FROM "table1" WHERE ( "col1" = 'A' OR "col2" = 'B' );]`, () => {
      const actual = sql
        .delete()
        .from(table1)
        .where(table1.c.col1.eq('A'), OR, table1.c.col2.eq('B'))
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE ( "col1" = 'A' OR "col2" = 'B' );`)
    })
    it(`Produces [DELETE FROM "table1" WHERE ( "col1" = 'A' AND "col2" = 'B' OR "col3" = 'C' );]`, () => {
      const actual = sql
        .delete()
        .from(table1)
        .where(
          table1.c.col1.eq('A'),
          AND,
          table1.c.col2.eq('B'),
          OR,
          table1.c.col3.eq('C'),
        )
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE ( "col1" = 'A' AND "col2" = 'B' OR "col3" = 'C' );`)
    })
    it(`Produces [DELETE FROM "table1" WHERE ( "col1" = 'A' OR "col2" = 'B' AND "col3" = 'C' );]`, () => {
      const actual = sql
        .delete()
        .from(table1)
        .where(
          table1.c.col1.eq('A'),
          OR,
          table1.c.col2.eq('B'),
          AND,
          table1.c.col3.eq('C'),
        )
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE ( "col1" = 'A' OR "col2" = 'B' AND "col3" = 'C' );`)
    })
  })

  describe('Delete with and/or', () => {
    it(`Produces [DELETE FROM "table1" WHERE "col1" = 'A' AND "col2" = 'B';]`, () => {
      const actual = sql
        .delete()
        .from(table1)
        .where(table1.c.col1.eq('A'))
        .and(table1.c.col2.eq('B'))
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE "col1" = 'A' AND "col2" = 'B';`)
    })
    it(`Produces [DELETE FROM "table1" WHERE "col1" = 'A' OR "col2" = 'B';]`, () => {
      const actual = sql
        .delete()
        .from(table1)
        .where(table1.c.col1.eq('A'))
        .or(table1.c.col2.eq('B'))
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE "col1" = 'A' OR "col2" = 'B';`)
    })
    it(`Produces [DELETE FROM "table1" WHERE "col1" = 'A' AND "col2" = 'B' OR "col3" = 'C';]`, () => {
      const actual = sql
        .delete()
        .from(table1)
        .where(table1.c.col1.eq('A'))
        .and(table1.c.col2.eq('B'))
        .or(table1.c.col3.eq('C'))
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE "col1" = 'A' AND "col2" = 'B' OR "col3" = 'C';`)
    })
    it(`Produces [DELETE FROM "table1" WHERE "col1" = 'A' OR "col2" = 'B' AND "col3" = 'C';]`, () => {
      const actual = sql
        .delete()
        .from(table1)
        .where(table1.c.col1.eq('A'))
        .or(table1.c.col2.eq('B'))
        .and(table1.c.col3.eq('C'))
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE "col1" = 'A' OR "col2" = 'B' AND "col3" = 'C';`)
    })
  })

  describe('Delete with returning', () => {
    it(`Produces [DELETE FROM "table1" RETURNING *;]`, () => {
      const actual = sql.deleteFrom(table1).returning(ASTERISK).getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" RETURNING *;`)
    })
    it(`Produces [DELETE FROM "table1" WHERE "col1" = 'A' RETURNING *;]`, () => {
      const actual = sql
        .deleteFrom(table1)
        .where(table1.c.col1.eq('A'))
        .returning(ASTERISK)
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE "col1" = 'A' RETURNING *;`)
    })
    it(`Produces [DELETE FROM "table1" WHERE "col1" = 'A' OR "col2" = 'B' RETURNING *;]`, () => {
      const actual = sql
        .deleteFrom(table1)
        .where(table1.c.col1.eq('A'))
        .or(table1.c.col2.eq('B'))
        .returning(ASTERISK)
        .getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" WHERE "col1" = 'A' OR "col2" = 'B' RETURNING *;`)
    })
    it(`Produces [DELETE FROM "table1" RETURNING "col1";]`, () => {
      const actual = sql.deleteFrom(table1).returning(table1.c.col1).getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" RETURNING "col1";`)
    })
    it(`Produces [DELETE FROM "table1" RETURNING "col1" AS "Column1";]`, () => {
      const actual = sql.deleteFrom(table1).returning(table1.c.col1.as('Column1')).getSQL()

      expect(actual).toEqual(`DELETE FROM "table1" RETURNING "col1" AS "Column1";`)
    })
  })
})
