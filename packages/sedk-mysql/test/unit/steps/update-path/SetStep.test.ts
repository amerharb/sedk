import { Binder } from '@src/binder'
import { RootStep, SetStep } from '@src/steps'
import { UpdateSetItemInfo } from '@src/UpdateSetItemInfo'
import { database } from '@test/database'
import { builderData } from '@test/builderData'

//Aliases
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col4 = table1.c.col4

describe('SetStep', () => {
	const rootStep = new RootStep(builderData)
	describe('use Primitive values', () => {
		it("returns: [SET `col1` = 'A']", () => {
			const items = [new UpdateSetItemInfo(col1, 'A')]
			const actual = new SetStep(rootStep, items).getStepStatement()
			expect(actual).toEqual("SET `col1` = 'A'")
		})
		it("returns: [SET `col1` = 'A', `col4` = 1]", () => {
			const items = [new UpdateSetItemInfo(col1, 'A'), new UpdateSetItemInfo(col4, 1)]
			const actual = new SetStep(rootStep, items).getStepStatement()
			expect(actual).toEqual("SET `col1` = 'A', `col4` = 1")
		})
	})
	describe('use Binders', () => {
		it("returns: [SET `col1` = $1, `col4` = $2]", () => {
			const items = [new UpdateSetItemInfo(col1, new Binder('A')), new UpdateSetItemInfo(col4, new Binder(1))]
			const actual = new SetStep(rootStep, items).getStepStatement()
			expect(actual).toEqual("SET `col1` = $1, `col4` = $2")
		})
	})
	describe('use Default', () => {
		//TODO: Add test
	})
	describe('use Expression', () => {
		//TODO: Add test
	})
})
