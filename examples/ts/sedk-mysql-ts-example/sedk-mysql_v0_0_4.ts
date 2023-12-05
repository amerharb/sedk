import { assert, log } from './util.js'
import * as sedk from 'sedk-mysql'

// Schema definition (practically this should be defined in one separate file for the whole project)
export const database = new sedk.Database({
	version: 1,
	schemas: {
		public: new sedk.Schema({
			name: 'public',
			tables: {
				Employee: new sedk.Table({
					name: 'Employee',
					columns: {
						name: new sedk.TextColumn({ name: 'name' }),
					},
				}),
				Manager: new sedk.Table({
					name: 'Manager',
					columns: {
						name: new sedk.TextColumn({ name: 'name' }),
					},
				}),
			},
		}),
	},
})

// Aliases
const Employee = database.s.public.t.Employee
const Manager = database.s.public.t.Manager

// Start to build SQL & Binder
const sql = sedk.builder(database)

const stmt1 = sql.selectAsteriskFrom(Employee).leftJoin(Manager).on(Employee.c.name.eq(Manager.c.name)).getSQL()
log(stmt1)
const expt1 = 'SELECT * FROM `Employee` LEFT JOIN `Manager` ON `Employee`.`name` = `Manager`.`name`;'
assert(stmt1 === expt1, '❌ stmt1 is not as expected')

const stmt2 = sql.selectAsteriskFrom(Employee).limit(50).offset(10).getSQL()
log(stmt2)
const expt2 = 'SELECT * FROM `Employee` LIMIT 50 OFFSET 10;'
assert(stmt2 === expt2, '❌ stmt2 is not as expected')

const stmt3 = sql.selectAsteriskFrom(Employee).limit(10, 50).getSQL()
log(stmt3)
const expt3 = 'SELECT * FROM `Employee` LIMIT 10, 50;'
assert(stmt3 === expt3, '❌ stmt3 is not as expected')

const sql4 = sql.selectAsteriskFrom(Employee).limit$(50).offset$(10)
const sql4Stmt = sql4.getSQL()
log(sql4Stmt)
const expt4Stmt = 'SELECT * FROM `Employee` LIMIT ? OFFSET ?;'
assert(sql4Stmt === expt4Stmt, '❌ sql4Stmt is not as expected')
const sql4Binders = sql4.getBindValues()
log(sql4Binders)
const expt4Binders = [50, 10]
assert(JSON.stringify(sql4.getBindValues()) === JSON.stringify(expt4Binders), '❌ sql4Stmt.getBindValues() is not as expected')

const sql5 = sql.selectAsteriskFrom(Employee).limit$(10, 50)
const sql5Stmt = sql5.getSQL()
log(sql5Stmt)
const expt5Stmt = 'SELECT * FROM `Employee` LIMIT ?, ?;'
assert(sql5Stmt === expt5Stmt, '❌ sql5Stmt is not as expected')
const sql5Binders = sql5.getBindValues()
log(sql5Binders)
const expt5Binders = [10, 50]
assert(JSON.stringify(sql5.getBindValues()) === JSON.stringify(expt5Binders), '❌ sql5Stmt.getBindValues() is not as expected')
