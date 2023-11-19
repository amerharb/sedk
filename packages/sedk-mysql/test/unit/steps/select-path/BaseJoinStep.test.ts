import { RootStep } from '@src/steps'
import { builderData } from '@test/builderData'
import { database } from '@test/database'
import { InnerJoinStep, JoinStep, LeftJoinStep, RightJoinStep } from '@src/steps/select-path/BaseJoinStep'

//Aliases
const table1 = database.s.public.t.table1

describe('BaseJoinStep', () => {
	const rootStep = new RootStep(builderData)
	describe('LeftJoin', () => {
		it('returns: [LEFT JOIN `table1` AS `t1`]', () => {
			const actual = new LeftJoinStep(rootStep, table1.as('t1')).getStepStatement()
			expect(actual).toEqual('LEFT JOIN `table1` AS `t1`')
		})
	})
	describe('RightJoin', () => {
		it('returns: [RIGHT JOIN `table1` AS `t1`]', () => {
			const actual = new RightJoinStep(rootStep, table1.as('t1')).getStepStatement()
			expect(actual).toEqual('RIGHT JOIN `table1` AS `t1`')
		})
	})
	describe('InnerJoin', () => {
		it('returns: [INNER JOIN `table1` AS `t1`]', () => {
			const actual = new InnerJoinStep(rootStep, table1.as('t1')).getStepStatement()
			expect(actual).toEqual('INNER JOIN `table1` AS `t1`')
		})
	})
	describe('Join', () => {
		it('returns: [JOIN `table1` AS `t1`]', () => {
			const actual = new JoinStep(rootStep, table1.as('t1')).getStepStatement()
			expect(actual).toEqual('JOIN `table1` AS `t1`')
		})
	})
})
