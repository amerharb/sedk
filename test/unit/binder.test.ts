import { BinderStore } from 'Non-Exported/binder'

describe('binder', () => {
	describe('BinderStore', () => {
		it.each([-1, 1.1, NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
		('Throws: "Offset should be a positive integer" for %s', (value) => {
			const actual = () => new BinderStore(value)
			expect(actual).toThrow(`Offset should be a positive integer`)
		})
	})
})
