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
		it(`returns: ['a', 'b', 'c']`, () => {
			const actual = getMinOneArray(['a', 'b', 'c'])
			expect(actual).toStrictEqual(['a', 'b', 'c'])
		})
		it(`returns: [1]`, () => {
			const actual = getMinOneArray([1])
			expect(actual).toStrictEqual([1])
		})
		it(`returns: [1, 2]`, () => {
			const actual = getMinOneArray([1, 2])
			expect(actual).toStrictEqual([1, 2])
		})
		it(`returns: [1, 2, 3]`, () => {
			const actual = getMinOneArray([1, 2, 3])
			expect(actual).toStrictEqual([1, 2, 3])
		})
		it('throws: "Array must have at least one element"', () => {
			const actual = () => getMinOneArray([])
			expect(actual).toThrow('Array must have at least one element')
		})
	})
})
