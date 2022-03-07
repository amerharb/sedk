# SEDK-postgres

SEDK is a library that build SQL statement with Postgres dialect or Postgres Binding Object using a pre-defined database
schema

### Example

```typescript
import * as sedk from 'sedk-postgres'

// Schema definition
const name = new sedk.TextColumn({ name: 'name' })
const age = new sedk.NumberColumn({ name: 'age' })
const Employee = new sedk.Table({ name: 'Employee', columns: { name, age } })
const publicSchema = new sedk.Schema({ name: 'public', tables: { Employee } })
const database = new sedk.Database({ version: 1, schema: { public: publicSchema } })

// Aliases
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


const bindObj = sql.select(name, age).from(Employee).where(name.eq$('John'), AND, age.gt$(25)).getBinds()
console.log(bindObj)
/*
{
  sql: 'SELECT "name", "age" FROM "Employee" WHERE ("name" = $1 AND "age" > $2);',
  values: ['john', 25],
}
 */
```

## What is New

### Version: 0.9.0

- Add GroupBy Step

```typescript
sql.select(name, f.avg(age).as('Employee Age Avrage')).from(Employee).groupBy(name).getSQL()
// SELECT "name", AVG("age") AS "Employee Age Avrage" FROM "Employee" GROUP BY "name";
```
or you can use 
```typescript
sql.select(name, age.avg.as('Employee Age Avrage')).from(Employee).groupBy(name).getSQL()
// SELECT "name", AVG("age") AS "Employee Age Avrage" FROM "Employee" GROUP BY "name";
```

### Version: 0.8.2

- Columns defined now as an object in Table class instead of array, so column can be called by its name from property "
  columns" (or just "c") for easy access

```typescript
const name = new sedk.TextColumn({ name: 'name' })
const age = new sedk.NumberColumn({ name: 'age' })
const Employee = new sedk.Table({ name: 'Employee', columns: { name, age } })
console.log(Employee.c.name.columnName) // print: name
console.log(Employee.c.age.columnName) // print: age
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
