import { OrderByStep, RootStep } from '@src/steps'
import { database } from '@test/database'
import { builderData } from '@test/builderData'

// Aliases
const table1 = database.s.public.t.table1
const table2 = database.s.public.t.table2
const col1 = table1.c.col1

describe('OrderByStep', () => {
	const rootStep = new RootStep(builderData)
	describe('getStepStatement()', () => {
		it('returns: [ORDER BY `col1`]', () => {
			const actual = new OrderByStep(rootStep, [col1]).getStepStatement()
			expect(actual).toEqual('ORDER BY `col1`')
		})
		it('returns: [ORDER BY `table1`.`col1`]', () => {
			const actual = new OrderByStep(rootStep, [col1])
				.getStepStatement({ tables: new Set([table1, table2]), columns: new Set([col1]) })
			expect(actual).toEqual('ORDER BY `table1`.`col1`')
		})
	})
	describe('limit()', () => {
		it('returns: [ORDER BY `col1` LIMIT 5]', () => {
			const actual = new OrderByStep(rootStep, [col1]).limit(5)
			expect(actual.getSQL()).toEqual('ORDER BY `col1` LIMIT 5;')
			expect(actual.getStepStatement()).toEqual('LIMIT 5')
		})
		it('returns: [ORDER BY `col1` LIMIT 2, 5]', () => {
			const actual = new OrderByStep(rootStep, [col1]).limit(2, 5)
			expect(actual.getSQL()).toEqual('ORDER BY `col1` LIMIT 2, 5;')
			expect(actual.getStepStatement()).toEqual('LIMIT 2, 5')
		})
		it('returns: [ORDER BY `col1` LIMIT ?]', () => {
			const actual = new OrderByStep(rootStep, [col1]).limit$(5)
			expect(actual.getSQL()).toEqual('ORDER BY `col1` LIMIT ?;')
			expect(actual.getStepStatement()).toEqual('LIMIT ?')
			expect(actual.getBindValues()).toEqual([5])
		})
		it.each([-1, 1.1, NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
		('throws: InvalidLimitValueError for limit %s', (value) => {
			const actual = () => new OrderByStep(rootStep, [col1]).limit(value)
			expect(actual).toThrow(`Invalid limit value: ${value}, value must be positive integer number`)
		})
		it.each([-1, 1.1, NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
		('throws: InvalidLimitValueError for limit %s with valid offset', (value) => {
			const actual = () => new OrderByStep(rootStep, [col1]).limit(1, value)
			expect(actual).toThrow(`Invalid limit value: ${value}, value must be positive integer number`)
		})
		it.each([-1, 1.1, NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
		('throws: InvalidLimitValueError for offset %s with valid limit', (value) => {
			const actual = () => new OrderByStep(rootStep, [col1]).limit(value, 10)
			expect(actual).toThrow(`Invalid offset value: ${value}, value must be positive integer number`)
		})
	})
	describe('offset()', () => {
		it('returns: [ORDER BY `col1` OFFSET 10]', () => {
			const actual = new OrderByStep(rootStep, [col1]).offset(10)
			expect(actual.getSQL()).toEqual('ORDER BY `col1` OFFSET 10;')
			expect(actual.getStepStatement()).toEqual('OFFSET 10')
		})
		it('returns: [ORDER BY `col1` LIMIT ?]', () => {
			const actual = new OrderByStep(rootStep, [col1]).offset$(10)
			expect(actual.getSQL()).toEqual('ORDER BY `col1` OFFSET ?;')
			expect(actual.getStepStatement()).toEqual('OFFSET ?')
			expect(actual.getBindValues()).toEqual([10])
		})
		it.each([-1, 1.1, NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
		('throws: InvalidLimitValueError for offset %s with valid limit', (value) => {
			const actual = () => new OrderByStep(rootStep, [col1]).offset(value)
			expect(actual).toThrow(`Invalid offset value: ${value}, value must be positive integer number`)
		})
	})
	describe('Errors', () => {
		it(`throws: Can't find select step to look for aliases`, () => {
			const actual = () => new OrderByStep(rootStep, ['column alias'])
			expect(actual).toThrow(`Can't find select step to look for aliases`)
		})
	})
})
