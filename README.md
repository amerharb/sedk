# SEDK-postgres

SEDK is a SQL builder library for Postgres dialect that support binding Object using a pre-defined database schema

### Example

```typescript
import * as sedk from 'sedk-postgres'

// Schema definition (practicly defined in one seperate file for the whole project)
export const database = new Database({
  version: 1,
  schemas: {
    public: new Schema({
      name: 'public',
      tables: {
        Employee: new Table({
          name: 'Employee',
          columns: {
            name: new TextColumn({ name: 'name' }),
            age: new NumberColumn({ name: 'age' }),
            isManager: new BooleanColumn({ name: 'isManager' }),
            startDate: new DateColumn({ name: 'startDate' }),
          },
        }),
      },
    }),
  },
})

// Aliases
const Employee = database.s.public.t.Employee
const name = Employee.c.name
const age = Employee.c.age
const AND = sedk.LogicalOperator.AND

// Start to build SQL & Binder
const sql = new sedk.Builder(database)

const stmt1 = sql.select(name, age).from(Employee).where(name.eq('John'), AND, age.gt(25)).getSQL()
console.log(stmt1)
// SELECT "name", "age" FROM "Employee" WHERE ("name" = 'John' AND "age" > 25);

// Also it can be written as
const stmt2 = sql.select(name, age).from(Employee).where(name.eq('John')).and(age.gt(25)).getSQL()
console.log(stmt2)
// SELECT "name", "age" FROM "Employee" WHERE "name" = 'John' AND "age" > 25;


const lastStep = sql.select(name, age).from(Employee).where(name.eq$('John'), AND, age.gt$(25))
console.log(lastStep.getSQL())
// SELECT "name", "age" FROM "Employee" WHERE ("name" = $1 AND "age" > $2);
console.log(lastStep.getBindValues())
//  ['john', 25]
```

## Rail Road logic
![SEDK steps](doc/StepsRailRoad.svg)

## What is New
### Version: 0.12.0
- Support Date Column which include Date and Timestamp with and without timezone
```typescript
const dob = new Date(Date.UTC(1979, 10, 14))
sql.selectAsteriskFrom(Employee).where(Employee.c.birthday.eq(dob)).getSQL();
// SELECT * FROM "Employee" WHERE "birthday" = '1979-11-14T00:00:00.000Z'
```

### Version: 0.11.7
- Bitwise operator accept string that contains number
- upgrade development dependencies

### Version: 0.11.6
- Fix Typescript build error "Operand file not found"
- Add ISC license file

### Version: 0.11.5
- Throw error in case of adding more than one WHERE step

### Version: 0.11.4
-   Add bitwise operation support `&`, `|` and `#`
```typescript
sql.selectAsteriskFrom(Employee).where(Employee.c.age.bitwiseAnd(1).eq(0)).getSQL()
// SELECT * FROM "Employee" WHERE "age" & 1 = 0;
```
also can be added with binder values
```typescript
sql.selectAsteriskFrom(Employee).where(Employee.c.age.bitwiseAnd$(1).eq$(0))
    .getSQL() // SQL: SELECT * FROM "Employee" WHERE "age" & $1 = $2;
    .getBindValues() // VALUES: [1, 0];
```

### Version: 0.11.3
- Fix some bugs

### Version: 0.11.1
- Change package.json files to include sub folders

### Version: 0.11.0

- From Step can have more than one table

```typescript
sql.select(Employee.c.name.as('Employee Name'), Manager.c.name.as('Manager Name')).from(Employee, Manager).getSQL()
// SELECT "Employee"."name" AS "Employee Name", "Manager"."name" AS "Manager Name" FROM "Employee", "Manager";
```

- CrossJoin Step can have more than one table

```typescript
sql.select(Employee.c.name, Manager.c.name).from(Employee).crossJoin(Manager).getSQL()
// SELECT "Employee"."name", "Manager"."name" FROM "Employee" CROSS JOIN "Manager";
```

- Table can be aliased

```typescript
sql.select(name).from(Employee.as('All Employees')).getSQL()
// SELECT "name" FROM "Employee" AS "All Employees";
```

- New option added

```typescript
{
  addAsBeforeTableAlias: 'always' | 'never'
}
```

- Join, Left Join, Right Join, Inner Join and Full Outer Join Steps has been added

```typescript
sql.selectAsteriskFrom(Employee).leftJoin(Manager).on(Employee.c.name.eq(Manager.c.name)).getSQL()
// SELECT * FROM "Employee" LEFT JOIN "Manager" ON "Employee"."name" = "Manager"."name";
```

### Version: 0.10.1

- Remove the limitation of version 0.10.0, Having step can contain aggregate function condition like:

```typescript
sql.select(name, f.avg(age).as('Employee Age Avrage')).from(Employee).groupBy(name).having(f.avg(age).gt(40)).getSQL()
// SELECT "name", AVG("age") AS "Employee Age Avrage" FROM "Employee" GROUP BY "name" HAVING AVG("age") > 40;
```

- New option added

```typescript
{
  addPublicSchemaName: 'always' | 'never' | 'when other schema mentioned'
  addTableName: 'always' | 'when two tables or more'
}
```

### Version: 0.10.0

- Add Having Step
- Add And and Or Steps for Having Step

#### Limitation

- Currently, Having step can only be used with Where conditions, aggregate function condition to be added later

```typescript
sql.select(name, f.avg(age).as('Employee Age Avrage')).from(Employee).groupBy(name).having(name.eq('John')).getSQL()
// SELECT "name", AVG("age") AS "Employee Age Avrage" FROM "Employee" GROUP BY "name" HAVING "name" = 'John';
```

### Version: 0.9.0

- Add GroupBy Step
- Add aggregated functions: sum(), avg(), count(), max() and min()

```typescript
sql.select(name, f.avg(age).as('Employee Age Avrage')).from(Employee).groupBy(name).getSQL()
// SELECT "name", AVG("age") AS "Employee Age Avrage" FROM "Employee" GROUP BY "name";
```

or you can use

```typescript
sql.select(name, age.avg.as('Employee Age Avrage')).from(Employee).groupBy(name).getSQL()
// SELECT "name", AVG("age") AS "Employee Age Avrage" FROM "Employee" GROUP BY "name";
```

- Add "$()" function that give binder directly from primitive type

```typescript
sql.select($(99)).from(Employee).getBinds()
/*
{
  sql: 'SELECT $1 FROM "Employee";',
  values: [99],
}
 */
```

### Version: 0.8.2

- Columns defined now as an object in Table class instead of array, so column can be called by its name from property "
  columns" (or just "c") for easy access

```typescript
const name = new sedk.TextColumn({ name: 'name' })
const age = new sedk.NumberColumn({ name: 'age' })
const Employee = new sedk.Table({ name: 'Employee', columns: { name, age } })
console.log(Employee.c.name.name) // print: name
console.log(Employee.c.age.name) // print: age
```

- Table defined now as an object in Schema class instead of array
- Schema defined now as an object in Database class instead of array

### Version: 0.8.1

- database schema include definition for schema and database class separately

### Version: 0.8.0

- LIMIT & OFFSET steps

```typescript
sql.selectAsteriskFrom(Employee).limit(50).offset(10).getSQL()
// SELECT * FROM "Employee" LIMIT 50 OFFSET 10;

sql.selectAsteriskFrom(Employee).limit$(50).offset$(10).getBinds()
/*
{
  sql: 'SELECT * FROM "Employee" LIMIT $1 OFFSET $2',
  values: [50, 10],
}
 */
```

### Version: 0.7.1

- ASC, DESC, NULLS_FIRST and NULLS_LAST can be added in OrderBy step

```typescript
sql.selectAsteriskFrom(Employee).orderBy(column1, ASC, NULLS_FIRST).getSQL()
// SELECT * FROM "Employee" ORDER BY "col1" ASC NULLS FIRST;
```

### Version: 0.7.0

- Table & column name always has double quote around their names
- Column can have an alias

```typescript
sql.select(name, age.as('Employee Age')).from(Employee).getSQL()
// SELECT "name", "age" AS "Employee Age" FROM "Employee";
```

- New Builder Option

```typescript
{
  addAsBeforeColumnAlias: 'always' | 'never'
}
```

- OrderBy Expression

```typescript
sql.selectAsteriskFrom(Employee).orderBy(e(age, ADD, salary)).getSQL()
// SELECT * FROM "Employee" ORDER BY ("age" + "salary");
```

- OrderBy using helper function o()

```typescript
sql.selectAsteriskFrom(Employee).orderBy(o(age, DESC, NULLS_FIRST)).getSQL()
// SELECT * FROM "Employee" ORDER BY "age" DESC NULLS_FIRST;
```

### Version: 0.6.0

- OrderBy now support ASC, DESC, NULLS FIRST and NULLS LAST

```typescript
sql.selectAsteriskFrom(Employee).orderBy(name.asc, age.desc).getSQL()
// "SELECT DISTINCT name, age FROM Employee ORDER BY name ASC, age DESC;"
```

- Support DISTINCT and ALL clause after SELECT

```typescript
sql.selectDistinct(name, age).from(Employee).getSQL()
// or like
sql.select(DISTINCT, name, age).from(Employee).getSQL()
// "SELECT DISTINCT name, age FROM Employee;"
```

- New Builder Option

```typescript
{
  addAscAfterOrderByItem: 'always' | 'never' | 'when mentioned'
  addNullsLastAfterOrderByItem: 'always' | 'never' | 'when mentioned'
}
```

### Version: 0.5.0

- Now you can add asterisk to Select step

```typescript
sql.select(ASTERISK).from(Employee).getSQL()
// "SELECT * FROM Employee"
```

- Also asterisk can be added with from in one function

```typescript
sql.selectAsteriskFrom(Employee).getSQL()
// "SELECT * FROM Employee"
```

- OrderBy step

```typescript
sql.select(ASTERISK).from(Employee).orderBy(age).getSQL()
// "SELECT * FROM Employee ORDER BY age"
```

current **orderBy** limitation

- Only takes the column name without AS
- Doesn't support ASC and DEC
