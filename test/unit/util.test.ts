import { getMinOneArray } from '@src/util'

describe('util', () => {
	describe('getMinOneArray()', () => {
		it(`returns: ['a']`, () => {
			const actual = getMinOneArray(['a'])
			expect(actual).toStrictEqual(['a'])
		})
		it(`returns: ['a', 'b']`, () => {
			const actual = getMinOneArray(['a', 'b'])
			expect(actual).toStrictEqual(['a', 'b'])
		})
		it('throws: "Array must have at least one element"', () => {
			const actual = () => getMinOneArray([])
			expect(actual).toThrow('Array must have at least one element')
		})
	})
})
