# SEDK-postgres V0.4.7

SEDK is a library that build SQL statement with Postgres flavour Or Postgres Binding Object using a pre-defined database
schema

### example

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

// or also can be written aa
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
