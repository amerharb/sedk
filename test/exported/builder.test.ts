import { ALL, Builder, DISTINCT, builder } from 'src'

import { database } from 'test/database'

//Alias
const table1 = database.s.public.t.table1

describe('builder', () => {
	describe('class new Builder()', () => {
		const sql = new Builder(database)
		afterEach(() => { sql.cleanUp() })
		it(`returns for select()`, () => {
			const actual = sql.select('a').getStepStatement()
			expect(actual).toEqual(`SELECT 'a'`)
		})
		it(`returns for select(ALL)`, () => {
			const actual = sql.select(ALL).getStepStatement()
			expect(actual).toEqual(`SELECT ALL`)
		})
		it(`throws for select(DISTINCT)`, () => {
			const actual = () => sql.select(DISTINCT).getStepStatement()
			expect(actual).toThrowError(`Select step must have at least one parameter after DISTINCT`)
		})
		it(`throws for select(ALL, DISTINCT)`, () => {
			// @ts-ignore
			const actual = () => sql.select(ALL, DISTINCT).getStepStatement()
			expect(actual).toThrowError(`You can not have more than one DISTINCT or ALL`)
		})
		it(`throws for select(DISTINCT, DISTINCT)`, () => {
			// @ts-ignore
			const actual = () => sql.select(DISTINCT, DISTINCT).getStepStatement()
			expect(actual).toThrowError(`You can not have more than one DISTINCT or ALL`)
		})
		it(`throws for select(ALL, ALL)`, () => {
			// @ts-ignore
			const actual = () => sql.select(ALL, ALL).getStepStatement()
			expect(actual).toThrowError(`You can not have more than one DISTINCT or ALL`)
		})
		it(`returns for select(DISTINCT, 'a')`, () => {
			const actual = sql.select(DISTINCT, 'a').getStepStatement()
			expect(actual).toEqual(`SELECT DISTINCT 'a'`)
		})
		it(`returns for selectAll()`, () => {
			const actual = sql.selectAll('a').getStepStatement()
			expect(actual).toEqual(`SELECT ALL 'a'`)
		})
		it(`returns for selectDistinct()`, () => {
			const actual = sql.selectDistinct('a').getStepStatement()
			expect(actual).toEqual(`SELECT DISTINCT 'a'`)
		})
		it(`returns for selectAsteriskFrom()`, () => {
			const actual = sql.selectAsteriskFrom(table1).getStepStatement()
			expect(actual).toEqual(`FROM "table1"`)
		})
		it(`returns for insert()`, () => {
			const actual = sql.insert().getStepStatement()
			expect(actual).toEqual(`INSERT`)
		})
		it(`returns for insertInto()`, () => {
			const actual = sql.insertInto(table1).getStepStatement()
			expect(actual).toEqual(`INTO "table1"`)
		})
		it(`returns for insertInto(table1, table1.c.col1)`, () => {
			const actual = sql.insertInto(table1, table1.c.col1).getStepStatement()
			expect(actual).toEqual(`("col1")`)
		})
		it(`returns for update()`, () => {
			const actual = sql.update(table1).getStepStatement()
			expect(actual).toEqual(`UPDATE "table1"`)
		})
		it(`returns for delete()`, () => {
			const actual = sql.delete().getStepStatement()
			expect(actual).toEqual(`DELETE`)
		})
		it(`returns for deleteFrom()`, () => {
			const actual = sql.deleteFrom(table1).getStepStatement()
			expect(actual).toEqual(`FROM "table1"`)
		})
	})
	describe('function builder()', () => {
		const sql = builder(database)
		it(`returns for select()`, () => {
			const actual = sql.select('a').getStepStatement()
			expect(actual).toEqual(`SELECT 'a'`)
		})
		it(`returns for select(ALL)`, () => {
			const actual = sql.select(ALL).getStepStatement()
			expect(actual).toEqual(`SELECT ALL`)
		})
		it(`throws for select(DISTINCT)`, () => {
			const actual = () => sql.select(DISTINCT).getStepStatement()
			expect(actual).toThrowError(`Select step must have at least one parameter after DISTINCT`)
		})
		it(`throws for select(ALL, DISTINCT)`, () => {
			// @ts-ignore
			const actual = () => sql.select(ALL, DISTINCT).getStepStatement()
			expect(actual).toThrowError(`You can not have more than one DISTINCT or ALL`)
		})
		it(`throws for select(DISTINCT, DISTINCT)`, () => {
			// @ts-ignore
			const actual = () => sql.select(DISTINCT, DISTINCT).getStepStatement()
			expect(actual).toThrowError(`You can not have more than one DISTINCT or ALL`)
		})
		it(`throws for select(ALL, ALL)`, () => {
			// @ts-ignore
			const actual = () => sql.select(ALL, ALL).getStepStatement()
			expect(actual).toThrowError(`You can not have more than one DISTINCT or ALL`)
		})
		it(`returns for select(DISTINCT, 'a')`, () => {
			const actual = sql.select(DISTINCT, 'a').getStepStatement()
			expect(actual).toEqual(`SELECT DISTINCT 'a'`)
		})
		it(`returns for selectAll()`, () => {
			const actual = sql.selectAll('a').getStepStatement()
			expect(actual).toEqual(`SELECT ALL 'a'`)
		})
		it(`returns for selectDistinct()`, () => {
			const actual = sql.selectDistinct('a').getStepStatement()
			expect(actual).toEqual(`SELECT DISTINCT 'a'`)
		})
		it(`returns for selectAsteriskFrom()`, () => {
			const actual = sql.selectAsteriskFrom(table1).getStepStatement()
			expect(actual).toEqual(`FROM "table1"`)
		})
		it(`returns for insert()`, () => {
			const actual = sql.insert().getStepStatement()
			expect(actual).toEqual(`INSERT`)
		})
		it(`returns for insertInto()`, () => {
			const actual = sql.insertInto(table1).getStepStatement()
			expect(actual).toEqual(`INTO "table1"`)
		})
		it(`returns for update()`, () => {
			const actual = sql.update(table1).getStepStatement()
			expect(actual).toEqual(`UPDATE "table1"`)
		})
		it(`returns for delete()`, () => {
			const actual = sql.delete().getStepStatement()
			expect(actual).toEqual(`DELETE`)
		})
		it(`returns for deleteFrom()`, () => {
			const actual = sql.deleteFrom(table1).getStepStatement()
			expect(actual).toEqual(`FROM "table1"`)
		})
	})
})
