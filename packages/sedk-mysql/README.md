# SEDK-mysql
[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/amerharb/sedk/tree/root/version/0.3.0)
[![License: GPLv3](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
![Coverage](https://raw.githubusercontent.com/amerharb/sedk/root/version/0.3.0/packages/sedk-mysql/badges/coverage.svg)
![Github workflow](https://github.com/amerharb/sedk/actions/workflows/test-lint.yaml/badge.svg?branch=main)

SEDK is a SQL builder library for MySQL dialect, support binding parameters, and use a pre-defined database schema

### Example

```typescript
import * as sedk from 'sedk-mysql'

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
console.log(stmt1)
// SELECT "name", "salary" FROM "Employee" WHERE ( "name" = 'John' AND "salary" > 1500 );

// Also it can be written as
const stmt2 = sql.select(name, salary).from(Employee).where(name.eq('John')).and(salary.gt(1500)).getSQL()
console.log(stmt2)
// SELECT "name", "salary" FROM "Employee" WHERE "name" = 'John' AND "salary" > 1500;

const binderExample = sql.select(name, salary).from(Employee).where(name.eq$('John'), AND, salary.gt$(1500))
console.log(binderExample.getSQL())
// SELECT "name", "salary" FROM "Employee" WHERE ( "name" = $1 AND "salary" > $2 );
console.log(binderExample.getBindValues())
//  [ 'John', 1500 ]
```

## SEDK-mysql Principles
1. **What You See Is What You Get:** SEDK build in a way that the sequence of the functions as if you are writing normal SQL query
2. **No Magic String:** Everything is defined as class or object, for example database schema names defined in one place one time,
currently the only place where string is used is when you define an alias for a column or aggregate function that string can be used again in orderBy()
3. **Not ORM:** SEDK is not and will not become an ORM, it is a SQL builder tool, using it is optional, and it won't build a layer between you and the database, so you can use it in some query and ignore it in others
4. **No Runtime Schema Change:** SEDK build in the mind set that you will not change your database schema without updating your code. Of course that is only valid for the part of the database that you actually use
5. **One Library One Dialect:** SEDK-mysql is made for MySQL hence the name, for Postgres you can use sedk-postgres in the future sedk-mssql, sedk-sqlite, sedk-sql92...etc. or even sedk-neo4j for graph 
so if you change from MySQL to Postgres then you will need to change the library too

## Steps Rail Road
![SEDK steps](https://raw.githubusercontent.com/amerharb/sedk/root/version/0.3.0/packages/sedk-postgres/doc/StepsRailRoad.svg)

## What is New

### Version: 0.0.1
- Use eq() in UPDATE instead of let() to be more WYSIWYG
