import { database } from '@test/database'

//Aliases
const table1 = database.s.public.t.table1

describe('Table', () => {
	describe('class Table', () => {
		// TODO: Add tests for Table
	})
	describe('class AliasedTable', () => {
		const aliasedTable = table1.as('t1')
		it('fqName/name/alias', () => {
			expect(aliasedTable.fqName).toEqual('"public"."table1"')
			expect(aliasedTable.name).toEqual('table1')
			expect(aliasedTable.alias).toEqual('t1')
		})
	})
})
