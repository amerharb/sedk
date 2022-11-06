import { BinderStore } from 'Non-Exported/binder'
import { Operand } from 'Non-Exported/models/Operand'
import { builderData } from 'test/unit/steps/builderData'

describe('Operand', () => {
	describe('getStmtOfValue()', () => {
		it('throws "Operand type of value: ? is not supported"', () => {
			const arg = { notSupported: 'invalid' }
			// @ts-ignore - for testing we are calling a private function
			const actual = () => Operand.getStmtOfValue(
				// @ts-ignore - for testing the arg is invalid
				arg,
				false,
				builderData,
				{ tables: new Set(), columns: new Set() },
				new BinderStore(0),
			)
			expect(actual).toThrow(`Operand type of value: ${arg} is not supported`)
		})
		it('returns [NOT TRUE]', () => {
			// @ts-ignore - for testing we are calling a private function
			const actual = Operand.getStmtOfValue(
				true,
				true,
				builderData,
				{ tables: new Set(), columns: new Set() },
				new BinderStore(0),
			)
			expect(actual).toEqual(`NOT TRUE`)
		})
	})
})
