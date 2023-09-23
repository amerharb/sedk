import { builder } from 'sedk-mysql'

/** test non-exported Classes */
import { isTextBoolean, isTextNumber } from '@src/models'
import { database } from '@test/database'

//Alias
const table1 = database.s.public.t.table1

describe('Import non-exported Classes', () => {
	const sql = builder(database, { throwErrorIfDeleteHasNoCondition: false })
	describe('Import: { isTextBoolean, isTextNumber }', () => {
		it(`isTextBoolean return false for not string`, () => {
			expect(isTextBoolean(123)).toEqual(false)
		})
		it(`isTextNumber return false for non-string`, () => {
			expect(isTextNumber('abc')).toEqual(false)
		})
		it(`isTextNumber return false for non-string`, () => {
			expect(isTextNumber(123)).toEqual(false)
		})
	})
})
