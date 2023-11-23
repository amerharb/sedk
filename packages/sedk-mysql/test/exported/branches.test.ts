import { builder } from 'sedk-mysql'
import { database } from '@test/database'

//Alias
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col3 = table1.c.col3
const table2 = database.s.public.t.table2

describe('Branches', () => {
	const sql = builder(database)
	describe('WHERE', () => {
		it('Produce 2 different statements for 2 basic WHERE steps added', () => {
			const fromStep = sql.select(col1).from(table1)

			const whereStep1 = fromStep.where(col1.eq('x1'))
			const whereStep2 = fromStep.where(col1.eq('x2'))

			expect(whereStep1.getSQL()).toEqual("SELECT `col1` FROM `table1` WHERE `col1` = 'x1';")
			expect(whereStep2.getSQL()).toEqual("SELECT `col1` FROM `table1` WHERE `col1` = 'x2';")
		})
		it('produce 2 different statements for 2 WHERE steps added after ON step', () => {
			const fromStep = sql
				.select(col1)
				.from(table1)
				.leftJoin(table2)
				.on(col1.eq(table2.c.col1))

			const whereStep1 = fromStep.where(col3.eq('x1'))
			const whereStep2 = fromStep.where(col3.eq('x2'))

			expect(whereStep1.getSQL()).toEqual("SELECT `table1`.`col1` FROM `table1` LEFT JOIN `table2` ON `table1`.`col1` = `table2`.`col1` WHERE `table1`.`col3` = 'x1';")
			expect(whereStep2.getSQL()).toEqual("SELECT `table1`.`col1` FROM `table1` LEFT JOIN `table2` ON `table1`.`col1` = `table2`.`col1` WHERE `table1`.`col3` = 'x2';")
		})
		it('produce 2 different statements for 2 WHERE steps added after DELETE step', () => {
			const fromStep = sql.deleteFrom(table1)

			const whereStep1 = fromStep.where(col1.eq('x1'))
			const whereStep2 = fromStep.where(col1.eq('x2'))

			expect(whereStep1.getSQL()).toEqual("DELETE FROM `table1` WHERE `col1` = 'x1';")
			expect(whereStep2.getSQL()).toEqual("DELETE FROM `table1` WHERE `col1` = 'x2';")
		})
		it('produce 2 different statements for 2 WHERE steps added UPDATE step', () => {
			const setStep = sql.update(table1).set(col1.eq('something'))

			const whereStep1 = setStep.where(col1.eq('x1'))
			const whereStep2 = setStep.where(col1.eq('x2'))

			expect(whereStep1.getSQL()).toEqual("UPDATE `table1` SET `col1` = 'something' WHERE `col1` = 'x1';")
			expect(whereStep2.getSQL()).toEqual("UPDATE `table1` SET `col1` = 'something' WHERE `col1` = 'x2';")
		})
	})
})
