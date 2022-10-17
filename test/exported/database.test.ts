import { Database, Schema, Table, TextColumn } from 'src'
import { database } from 'test/database'

const anotherDatabase = new Database({
	version: 1,
	schemas: {
		public: new Schema({
			name: 'public',
			tables: {
				table1: new Table({
					name: 'table1',
					columns: {
						col1: new TextColumn({ name: 'col1' }),
					},
				}),
			},
		}),
	},
})

describe('database: Database/Schema/Table', () => {
	describe('Database', () => {
		it(`isSchemaExist() returns true`, () => {
			expect(database.isSchemaExist(database.s.public)).toBe(true)
			expect(database.isSchemaExist(database.s.schema1)).toBe(true)
		})
		it(`isSchemaExist() returns false`, () => {
			expect(database.isSchemaExist(anotherDatabase.s.public)).toBe(false)
		})
	})
	describe('Schema', () => {
		it(`set/get database works`, () => {
			const schema = new Schema({ name: 'public', tables: {} })
			schema.database = anotherDatabase
			expect(schema.database).toBe(anotherDatabase)
		})
		it(`return public for schema without name `, () => {
			const schema = new Schema({ tables: {} })
			expect(schema.name).toBe('public')
		})
	})
	describe('Table', () => {
		it(`set/get schema works`, () => {
			const tableX = new Table({ name: 'tableX', columns: {} })
			tableX.schema = anotherDatabase.s.public
			expect(tableX.schema).toBe(anotherDatabase.s.public)
		})
	})
})
