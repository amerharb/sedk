import { NumberColumn } from 'sedk-mysql'

// test non-exported Classes
import { Operand } from '@src/models'
import { Binder, BinderArray, BinderStore } from '@src/binder'
import { Column } from '@src/database'

import { database } from '@test/database'

//Alias
const table1 = database.s.public.t.table1

describe('Throw desired Errors', () => {
	describe('Binder', () => {
		it('Throws: "This binder already stored"', () => {
			function actual() {
				const binderStore = new BinderStore(0)
				const binder = new Binder('value')
				binderStore.add(binder)
				binderStore.add(binder)
			}

			expect(actual).toThrow(`This binder already stored`)
		})
		it('Throws: "This Binder already has a number"', () => {
			function actual() {
				const binder = new Binder('value', 1)
				binder.no = 2
			}

			expect(actual).toThrow(`This Binder already has a number`)
		})
		it('Throws: "Unknown type of value: [object Object]"', () => {
			const value = { something: 'Unknown type' }
			const actual = () => {
				// @ts-ignore - the value is not the correct type
				new Binder(value)
			}
			expect(actual).toThrow(`Unknown type of value: ${value}`)
		})
		it.each([NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
		('Throws: "Unknown type of value: %s"', (value) => {
			const actual = () => new Binder(value)
			expect(actual).toThrow(`Unknown type of value: ${value}`)
		})
	})

	describe('BinderArray', () => {
		it('Throws: "BinderArray must have at least one element"', () => {
			function actual() {
				new BinderArray([])
			}

			expect(actual).toThrow(`BinderArray must have at least one element`)
		})
		it('Throws: "All binders in BinderArray must be same type"', () => {
			function actual() {
				new BinderArray([new Binder(1), new Binder('a')])
			}

			expect(actual).toThrow(`All binders in BinderArray must be same type`)
		})
		it('Not throws', () => {
			function actual() {
				new BinderArray([new Binder(1), new Binder(2)])
			}

			expect(actual).not.toThrow(`BinderArray must have at least one element`)
			expect(actual).not.toThrow(`All binders in BinderArray must be same type`)
		})
	})

	describe('Column', () => {
		it(`Throws: "Table can only be assigned one time"`, () => {
			function actual() {
				table1.c.col1.table = table1
			}

			expect(actual).toThrow(`Table can only be assigned one time`)
		})

		it(`Throws: "Table was not assigned"`, () => {
			function actual() {
				const col = new NumberColumn({ name: 'test_col' })
				col.table // read table value
			}

			expect(actual).toThrow(`Table was not assigned`)
		})

		it(`Throws: "Table of this column is undefined"`, () => {
			function actual() {
				const col = new NumberColumn({ name: 'test_col' })
				// @ts-ignore - data object is not needed for this test
				col.getStmt({})
			}

			expect(actual).toThrow(`Table of this column is undefined`)
		})
	})

	describe('Operand', () => {
		it(`Throws: "Operand type of: ? is not supported"`, () => {
			const operandValue = { something: 'not supported' }

			function actual() {
				// @ts-ignore - any unsupported type
				new Operand(operandValue)
			}

			expect(actual).toThrow(`Operand type of: ${operandValue} is not supported`)
		})
		it(`Throws: "You can not use "NOT" modifier unless expression type is boolean"`, () => {
			function actual() {
				new Operand('not boolean', true)
			}

			expect(actual).toThrow(`You can not use "NOT" modifier unless expression type is boolean`)
		})
		it.each([NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
		(`Throws: "Operand type of: %s is not supported""`, (value) => {
			const actual = () => new Operand(value)
			expect(actual).toThrow(`Operand type of: ${value} is not supported`)
		})
	})
})
