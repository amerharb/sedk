# SEDK-postgres

SEDK is a library that build SQL statement with Postgres dialect or Postgres Binding Object using a pre-defined database
schema

### Example

```typescript
import * as sedk from 'sedk-postgres'

//define the schema
const name = new sedk.TextColumn("name")
const age = new sedk.NumberColumn("age")
const Employee = new sedk.Table('Employee', [name, age])
const schema = new sedk.Database([Employee])

//Aliases
const AND = sedk.LogicalOperator.AND


// start to build your SQL & Binder
const sql = new sedk.Builder(schema)

const stmt1 = sql.select(name, age).from(Employee).where(name.eq('John'), AND, age.gt(25)).getSQL()
console.log(stmt1)
// "SELECT name, age FROM Employee WHERE (name = 'John' AND age > 25);"

// also it can be written as
const stmt2 = sql.select(name, age).from(Employee).where(name.eq('John')).and(age.gt(25)).getSQL()
console.log(stmt2)
// "SELECT name, age FROM Employee WHERE name = 'John' AND age > 25;"


const bindObj = sql.select(name, age).from(Employee).where(name.eq$('John'), AND, age.gt$(25)).getPostgresqlBinding()
console.log(bindObj)
/*
{
  sql: 'SELECT name, age FROM Employee WHERE (name = $1 AND age > $2);',
  values: ['john', 25],
}
*/
```

## What is New
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
  addAscAfterOrderByItem?: 'always'|'never'|'when mentioned'
  addNullsLastAfterOrderByItem?: 'always'|'never'|'when mentioned'
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
