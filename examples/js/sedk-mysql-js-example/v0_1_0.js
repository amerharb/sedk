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
						manager: new sedk.TextColumn({ name: 'manager' }),
					},
				}),
			},
		}),
	},
})

// Aliases
const Employee = database.s.public.t.Employee

// Start to build SQL & Binder
const sql = sedk.builder(database)
const e = Employee.as('e')
const m = Employee.as('m')

const stmt1 = sql
	.select(e.table.c.name.as('employee_name'), m.table.c.name.as('employee_manager_name'))
	.from(e)
	.leftJoin(m)
	.on(e.table.c.manager.eq(m.table.c.name)).getSQL()

console.log(stmt1)
const expt1 = 'SELECT `name` AS `employee_name`, `name` AS `employee_manager_name` FROM `Employee` AS `e` LEFT JOIN `Employee` AS `m` ON `manager` = `name`;'
// TODO: above this is temporary, actual desired output is:
// const expt1 = `SELECT "e"."name" AS "employee_name", "m"."name" AS "employee_manager_name" FROM "Employee" AS "e" LEFT JOIN "Employee" AS "m" ON "e"."manager" = "m"."name";`
console.assert(stmt1 === expt1, '❌ stmt1 is not as expected.\nactual: ' + stmt1)
