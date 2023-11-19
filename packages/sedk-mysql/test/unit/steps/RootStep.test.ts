import { RootStep } from '@src/steps'
import { builderData } from '@test/builderData'
import { BuilderData } from '@src/builder'
import { database } from '@test/database'

describe('RootStep', () => {
	it('getSQL return [;]',()=> {
		expect(new RootStep(builderData).getSQL()).toEqual(';')
	})
	it('getSQL return []',()=> {
		const builderDataWithoutSemicolon: BuilderData = {
			database,
			option: {
				useSemicolonAtTheEnd: false,
				addAscAfterOrderByItem: 'when mentioned',
				addNullsLastAfterOrderByItem: 'when mentioned',
				addAsBeforeColumnAlias: 'always',
				addPublicSchemaName: 'never',
				addTableName: 'when two tables or more',
				addAsBeforeTableAlias: 'always',
				throwErrorIfDeleteHasNoCondition: true,
			},
		}
		expect(new RootStep(builderDataWithoutSemicolon).getSQL()).toEqual('')
	})
	it('getStepStatement return empty string',()=> {
		expect(new RootStep(builderData).getStepStatement()).toEqual('')
	})
})
