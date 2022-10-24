import { LogicalOperator } from 'src'
import { Parenthesis, RootStep, SelectWhereStep } from 'Non-Exported/steps'
import { database } from 'test/database'
import { builderData } from 'test/nonExported/steps/builderData'

//Aliases
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col4 = table1.c.col4
const col7 = table1.c.col7
const AND = LogicalOperator.AND
const OPEN = Parenthesis.Open
const CLOSE = Parenthesis.Close

describe('SelectConditionStep', () => {
	const rootStep = new RootStep(builderData)
	describe('SelectWhereStep', () => {
		// TODO: reevaluate the expected SQL here, maybe it should return only WHERE, or throw an error
		it('returns: []', () => {
			const actual = new SelectWhereStep(
				builderData,
				rootStep,
				[],
			).getStepStatement()
			expect(actual).toEqual('')
		})
		it('returns: [WHERE "col7"]', () => {
			const actual = new SelectWhereStep(
				builderData,
				rootStep,
				[col7],
			).getStepStatement()
			expect(actual).toEqual(`WHERE "col7"`)
		})
		it(`returns: [WHERE "col1" = 'A' AND "col4" = 1]`, () => {
			const actual = new SelectWhereStep(
				builderData,
				rootStep,
				[OPEN, col1.eq('A'), AND, col4.eq(1), CLOSE],
			).getStepStatement()
			expect(actual).toEqual(`WHERE ( "col1" = 'A' AND "col4" = 1 )`)
		})
	})
})
