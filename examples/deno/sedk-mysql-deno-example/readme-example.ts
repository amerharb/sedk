import { assert, log } from './util.ts'
import * as sedk from 'npm:sedk-mysql@0.1.0-next.0'

// Schema definition (practically this should be defined in one separate file for the whole project)
const database = new sedk.Database({
	version: 1,
	schemas: {
		public: new sedk.Schema({
			name: 'public',
			tables: {
				Employee: new sedk.Table({
					name: 'Employee',
					columns: {
						name: new sedk.TextColumn({ name: 'name' }),
						salary: new sedk.NumberColumn({ name: 'salary' }),
						isManager: new sedk.BooleanColumn({ name: 'isManager' }),
						startDate: new sedk.DateColumn({ name: 'startDate' }),
					},
				}),
			},
		}),
	},
})

// Aliases
const Employee = database.s.public.t.Employee
const name = Employee.c.name
const salary = Employee.c.salary
const AND = sedk.LogicalOperator.AND

// Start to build SQL & Binder
const sql = sedk.builder(database)

const stmt1 = sql.select(name, salary).from(Employee).where(name.eq('John'), AND, salary.gt(1500)).getSQL()
log(stmt1)
const expt1 = "SELECT `name`, `salary` FROM `Employee` WHERE ( `name` = 'John' AND `salary` > 1500 );"
assert(stmt1 === expt1, '❌ stmt1 is not as expected')

// Also it can be written as
const stmt2 = sql.select(name, salary).from(Employee).where(name.eq('John')).and(salary.gt(1500)).getSQL()
log(stmt2)
const expt2 = "SELECT `name`, `salary` FROM `Employee` WHERE `name` = 'John' AND `salary` > 1500;"
assert(stmt2 === expt2, '❌ stmt2 is not as expected')

const binderExample = sql.select(name, salary).from(Employee).where(name.eq$('John'), AND, salary.gt$(1500))
log(binderExample.getSQL())
const expt3 = 'SELECT `name`, `salary` FROM `Employee` WHERE ( `name` = ? AND `salary` > ? );'
assert(binderExample.getSQL() === expt3, '❌ binderExample.getSQL() is not as expected')
log(binderExample.getBindValues())
const expt3Arr = [ 'John', 1500 ]
assert(JSON.stringify(binderExample.getBindValues()) === JSON.stringify(expt3Arr), '❌ binderExample.getBindValues() is not as expected')
