import { builder } from 'src'

import { ReturningItemInfo } from 'Non-Exported/ReturningItemInfo'
import { database } from 'test/database'

describe('BooleanColumn', () => {
	const sql = builder(database, { throwErrorIfDeleteHasNoCondition: false })
	afterEach(() => { sql.cleanUp() })
	it(`getColumns returns array of one item of itself`, () => {
		const actual = database.s.public.t.table1.c.col7.getColumns()
		expect(actual).toEqual([database.s.public.t.table1.c.col7])
	})
})
