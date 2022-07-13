import {
  InvalidConditionError,
  Builder,
  ArithmeticOperator,
  ComparisonOperator,
} from '../../src'

// test non-exported Classes
import { Condition } from '../../src/models/Condition'
import { Expression } from '../../src/models/Expression'

import { database } from '../database'

//Alias
const table1 = database.s.public.t.table1

describe('Throw desired Errors', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })

  describe('Error: InvalidConditionError', () => {
    it(`Throws error when condition created with only "NUMBER"`, () => {
      function actual() {
        sql
          .selectAsteriskFrom(table1)
          .where(new Condition(new Expression(1)))
          .getSQL()
      }

      expect(actual).toThrow(InvalidConditionError)
      expect(actual).toThrow(`Condition can not created with only "NUMBER"`)
    })
  })
})
