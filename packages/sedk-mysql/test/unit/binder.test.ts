import { BinderStore } from '@src/binder'

describe('binder', () => {
	describe('BinderStore', () => {
		it.each([-1, 1.1, NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
		('Throws: "Binder offset should be a positive integer" for %s', (value) => {
			const actual = () => new BinderStore(value)
			expect(actual).toThrow(`Binder offset should be a positive integer`)
		})
	})
})
