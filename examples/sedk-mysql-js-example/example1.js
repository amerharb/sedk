import './readme-example.js'
import * as sedk from 'sedk-mysql';

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
                        name: new sedk.TextColumn({name: 'name'}),
                        salary: new sedk.NumberColumn({name: 'salary'}),
                        isManager: new sedk.BooleanColumn({name: 'isManager'}),
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
console.log(stmt1)
const expt1 = "SELECT `name`, `salary` FROM `Employee` WHERE ( `name` = 'John' AND `salary` > 1500 );"
console.assert(stmt1 === expt1, 'stmt1 is not as expected')

// Also it can be written as
const stmt2 = sql.select(name, salary).from(Employee).where(name.eq('John')).and(salary.gt(1500)).getSQL()
console.log(stmt2)
const expt2 = "SELECT `name`, `salary` FROM `Employee` WHERE `name` = 'John' AND `salary` > 1500;"
console.assert(stmt2 === expt2, 'stmt2 is not as expected')

const binderExample = sql.select(name, salary).from(Employee).where(name.eq$('John'), AND, salary.gt$(1500))
console.log(binderExample.getSQL())
const expt3 = "SELECT `name`, `salary` FROM `Employee` WHERE ( `name` = ? AND `salary` > ? );"
console.assert(binderExample.getSQL() === expt3, 'binderExample.getSQL() is not as expected')
console.log(binderExample.getBindValues())
const expt3Arr = ['John', 1500]
console.assert(JSON.stringify(binderExample.getBindValues()) === JSON.stringify(expt3Arr), 'binderExample.getBindValues() is not as expected')

const bind4 = sql.selectAsteriskFrom(Employee).where(name.eq$('John'), AND, salary.gt$(1500))
console.log(bind4.getSQL())
const expt4 = "SELECT * FROM `Employee` WHERE ( `name` = ? AND `salary` > ? );"
console.assert(bind4.getSQL() === expt4, 'bind4.getSQL() is not as expected')
console.log(bind4.getBindValues())
const expt4Arr = ['John', 1500]
console.assert(JSON.stringify(bind4.getBindValues()) === JSON.stringify(expt4Arr), 'bind4.getBindValues() is not as expected')

const bind5 = sql.deleteFrom(Employee).where(name.eq$('John'), AND, salary.gt$(1500))
console.log(bind5.getSQL())
const expt5 = "DELETE FROM `Employee` WHERE ( `name` = ? AND `salary` > ? );"
console.assert(bind5.getSQL() === expt5, 'bind5.getSQL() is not as expected')
console.log(bind5.getBindValues())
const expt5Arr = ['John', 1500]
console.assert(JSON.stringify(bind5.getBindValues()) === JSON.stringify(expt5Arr), 'bind5.getBindValues() is not as expected')
