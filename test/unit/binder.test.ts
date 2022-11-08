import { BinderStore } from '@src/binder'

describe('binder', () => {
	describe('BinderStore', () => {
		it.each([-1, 1.1, NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
		('Throws: "Binder offset should be a positive integer" for %s', (value) => {
			const actual = () => new BinderStore(value)
			expect(actual).toThrow(`Binder offset should be a positive integer`)
		})
		describe('cleanUp()', () => {
			it('do nothing', () => {
				const binderStore = new BinderStore(0)
				expect(binderStore.cleanUp()).toBeUndefined()
				expect(() => binderStore.cleanUp()).not.toThrow()
			})
		})
	})
})
