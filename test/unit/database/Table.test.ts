import { Artifacts } from '@src/steps/BaseStep'
import { database } from '@test/database'
import { builderData } from '@test/builderData'
//Aliases
const table1 = database.s.public.t.table1

describe('Table', () => {
	const artifacts: Artifacts = { tables: new Set(), columns: new Set() }
	describe('class Table', () => {
		it('should have a name', () => {
			expect(table1.name).toBe('table1')
			expect(table1.fqName).toBe('"public"."table1"')
			expect(table1.schema.name).toBe('public')
			expect(table1.ASTERISK.getStmt(builderData, artifacts)).toBe('"table1".*')
		})
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
