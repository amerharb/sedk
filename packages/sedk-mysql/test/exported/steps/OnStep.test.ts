import { builder } from 'sedk-mysql'
import { database } from '@test/database'
/**
 * exceptional case where we import non-exported class in exported unit test
 *  as we are using it as type only
 */
import { OnStep } from '@src/steps'

//Alias
const table1 = database.s.public.t.table1
const table1Col1 = table1.c.col1
const table2 = database.s.public.t.table2
const table2Col1 = table2.c.col1
const table3 = database.s.public.t.table3
const table3Col1 = table3.c.col1

describe('test on step', () => {
	const sql = builder(database)
	let onStep: OnStep

	beforeEach(() => {
		onStep = sql
			.selectAsteriskFrom(table1)
			.join(table2)
			.on(table1Col1.eq(table2.c.col1))
	})

	describe('test getSQL() without binders', () => {
		it('Produces [SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` JOIN `table3` ON `table3`.`col1` = `table2`.`col1`;]', () => {
			const actual = onStep
				.join(table3)
				.on(table3Col1.eq(table2Col1))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` JOIN `table3` ON `table3`.`col1` = `table2`.`col1`;')
		})
		it('Produces [SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` LEFT JOIN `table3` ON `table3`.`col1` = `table2`.`col1`;]', () => {
			const actual = onStep
				.leftJoin(table3)
				.on(table3Col1.eq(table2Col1))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` LEFT JOIN `table3` ON `table3`.`col1` = `table2`.`col1`;')
		})
		it('Produces [SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` RIGHT JOIN `table3` ON `table3`.`col1` = `table2`.`col1`;]', () => {
			const actual = onStep
				.rightJoin(table3)
				.on(table3Col1.eq(table2Col1))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` RIGHT JOIN `table3` ON `table3`.`col1` = `table2`.`col1`;')
		})
		it('Produces [SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` INNER JOIN `table3` ON `table3`.`col1` = `table2`.`col1`;]', () => {
			const actual = onStep
				.innerJoin(table3)
				.on(table3Col1.eq(table2Col1))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` INNER JOIN `table3` ON `table3`.`col1` = `table2`.`col1`;')
		})
		it('Produces [SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` LIMIT ?;]', () => {
			const actual = onStep.limit$(10)
			expect(actual.getSQL()).toEqual('SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` LIMIT ?;')
			expect(actual.getBindValues()).toEqual([10])
		})
		it('Produces [SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` LIMIT ?, ?;]', () => {
			const actual = onStep.limit$(20, 10)
			expect(actual.getSQL()).toEqual('SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` LIMIT ?, ?;')
			expect(actual.getBindValues()).toEqual([20, 10])
		})
		it('Produces [SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` OFFSET ?;]', () => {
			const actual = onStep.offset$(20)
			expect(actual.getSQL()).toEqual('SELECT * FROM `table1` JOIN `table2` ON `table1`.`col1` = `table2`.`col1` OFFSET ?;')
			expect(actual.getBindValues()).toEqual([20])
		})
	})
})
