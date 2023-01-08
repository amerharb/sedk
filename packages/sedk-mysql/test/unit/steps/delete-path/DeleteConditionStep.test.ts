import { LogicalOperator } from 'sedk-mysql'
import { DeleteWhereStep, Parenthesis, RootStep } from '@src/steps'
import { database } from '@test/database'
import { builderData } from '@test/builderData'

//Aliases
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col4 = table1.c.col4
const col7 = table1.c.col7
const AND = LogicalOperator.AND
const OPEN = Parenthesis.Open
const CLOSE = Parenthesis.Close

describe('DeleteConditionStep', () => {
	const rootStep = new RootStep(builderData)
	describe('DeleteConditionStep', () => {
		// TODO: add unit test to test Abstract class DeleteConditionStep if it make sense
	})
	describe('DeleteWhereStep', () => {
		// TODO: reevaluate the expected SQL here, maybe it should return only WHERE, or throw an error
		it('returns: []', () => {
			const actual = new DeleteWhereStep(
				rootStep,
				[],
			).getStepStatement()
			expect(actual).toEqual('')
		})
		it('returns: [WHERE "col7"]', () => {
			const actual = new DeleteWhereStep(
				rootStep,
				[col7],
			).getStepStatement()
			expect(actual).toEqual(`WHERE "col7"`)
		})
		it(`returns: [WHERE "col1" = 'A' AND "col4" = 1]`, () => {
			const actual = new DeleteWhereStep(
				rootStep,
				[OPEN, col1.eq('A'), AND, col4.eq(1), CLOSE],
			).getStepStatement()
			expect(actual).toEqual(`WHERE ( "col1" = 'A' AND "col4" = 1 )`)
		})
	})
	describe('DeleteWhereAndStep', () => {
		// TODO: add unit test to test class DeleteWhereAndStep if it make sense
	})
	describe('DeleteWhereOrStep', () => {
		// TODO: add unit test to test class DeleteWhereOrStep if it make sense
	})

})
