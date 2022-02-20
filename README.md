# SEDK-postgres

SEDK is a library that build SQL statement with Postgres dialect or Postgres Binding Object using a pre-defined database
schema

### Example

```typescript
import * as sedk from 'sedk-postgres'

//define the schema
export const name = new sedk.TextColumn({ name: 'col7' })
export const age = new sedk.NumberColumn({ name: 'col8' })
export const Employee = new sedk.Table({ name: 'Employee', columns: [name, age] })
export const schema = new sedk.Schema({ name: 'public', tables: [Employee] })
export const database = new sedk.Database({ version: 1, schemas: [schema] })

//Aliases
const AND = sedk.LogicalOperator.AND

// start to build your SQL & Binder
const sql = new sedk.Builder(schema)

const stmt1 = sql.select(name, age).from(Employee).where(name.eq('John'), AND, age.gt(25)).getSQL()
console.log(stmt1)
// SELECT "name", "age" FROM Employee WHERE ("name" = 'John' AND "age" > 25);

// also it can be written as
const stmt2 = sql.select(name, age).from(Employee).where(name.eq('John')).and(age.gt(25)).getSQL()
console.log(stmt2)
// SELECT "name", "age" FROM Employee WHERE "name" = 'John' AND "age" > 25;


const bindObj = sql.select(name, age).from(Employee).where(name.eq$('John'), AND, age.gt$(25)).getBinds()
console.log(bindObj)
/*
{
  sql: 'SELECT "name", "age" FROM Employee WHERE ("name" = $1 AND "age" > $2);',
  values: ['john', 25],
}
 */
```

## What is New
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
  addAsBeforeColumnAlias: 'always'|'never'
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
  addAscAfterOrderByItem: 'always'|'never'|'when mentioned'
  addNullsLastAfterOrderByItem: 'always'|'never'|'when mentioned'
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
sql.select(ASTERISK).from(Employee).OrderBy(age).getSQL()
// "SELECT * FROM Employee ORDER BY age"
```
current **orderBy** limitation
- Only takes the column name without AS
- Doesn't support ASC and DEC
