import * as sedk from '../../../src'
import { database } from '../../database'

//Alias
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col4 = table1.c.col4
const col7 = table1.c.col7
const col9 = table1.c.col9

describe('UPDATE Path', () => {
  const sql = new sedk.Builder(database)
  afterEach(() => { sql.cleanUp() })
  const EPOCH_2022_07_23 = Date.UTC(2022, 6, 23)
  describe('Basic update all', () => {
    it(`Produces [UPDATE "table1" SET "col1" = 'A';]`, () => {
      const actual = sql
        .update(table1)
        .set(col1.put('A'))
        .getSQL()
      expect(actual).toEqual(`UPDATE "table1" SET "col1" = 'A';`)
    })
    it(`Produces [UPDATE "table1" SET "col1" = 'A', "col4" = 1, "col7" = TRUE, "col9" = '2022-07-23T00:00:00.000Z';]`, () => {
      const actual = sql
        .update(table1)
        .set(col1.put('A'), col4.put(1), col7.put(true), col9.put(new Date(EPOCH_2022_07_23)))
        .getSQL()
      expect(actual).toEqual(`UPDATE "table1" SET "col1" = 'A', "col4" = 1, "col7" = TRUE, "col9" = '2022-07-23T00:00:00.000Z';`)
    })
    it(`Produces [UPDATE "table1" SET "col1" = NULL, "col4" = NULL, "col7" = NULL, "col9" = NULL;]`, () => {
      const actual = sql
        .update(table1)
        .set(
          col1.put(null),
          col4.put(null),
          col7.put(null),
          col9.put(null),
        )
        .getSQL()
      expect(actual).toEqual(`UPDATE "table1" SET "col1" = NULL, "col4" = NULL, "col7" = NULL, "col9" = NULL;`)
    })
  })
})
