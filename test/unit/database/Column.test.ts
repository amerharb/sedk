import { database } from '@test/database'

describe('Column', () => {
	it('fqName',()=> {
		expect(database.s.public.t.table1.c.col1.fqName).toEqual('"public"."table1"."col1"')
		expect(database.s.schema1.t.table2.c.col1.fqName).toEqual('"schema1"."table2"."col1"')
	})
})
