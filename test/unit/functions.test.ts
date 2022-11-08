import { Binder, BinderStore } from '@src/binder'
import { Condition, Expression } from '@src/models'
import { Artifacts } from '@src/steps/BaseStep'
import { ArithmeticOperator, ComparisonOperator, e } from 'sedk-postgres'
import { builderData } from '@test/unit/steps/builderData'

//Aliases
const Equal = ComparisonOperator.Equal
const ADD = ArithmeticOperator.ADD
const emptyArtifacts: Artifacts = { tables: new Set(), columns: new Set() }

describe('functions', () => {
	describe('e()', () => {
		it('returns Condition', () => {
			expect(e(e(1), Equal, e(1))).toBeInstanceOf(Condition)
		})
		it('takes Binder', () => {
			const actual = e(new Binder(1), ADD, 1)
			expect(actual).toBeInstanceOf(Expression)
			expect(actual.getStmt(builderData, emptyArtifacts, new BinderStore(0))).toEqual('($1 + 1)')
		})
	})
})
