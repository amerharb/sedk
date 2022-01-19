# SEDK-postgres V0.4.5

SEDK is a libaray that build SQL statement (Postgres flavour) Or Postgres Binding Object using a pre-defined database
schema

### example

```typescript
import * as sedk from 'sedk-postgres'

//define the schema
const name = new sedk.TextColumn("name")
const age = new sedk.NumberColumn("age")
const Employee = new sedk.Table('Employee', [name, age])
const schema = new sedk.Database([Employee])

// start to build your SQL & Binder
const sql = new sedk.Builder(schema)

sql.select(name, age).from(Employee).where(name.eq('John'), AND, age.gt(25)).getSQL()
// "SELECT name, age FROM Employee WHERE name = 'John' AND age > 25;"

sql.select(name, age).from(Employee).where(name.eq$('John'), AND, age.gt$(25)).getPostgresqlBinding()
/*
{
  sql: 'SELECT name, age FROM Employee WHERE name = $1 AND age > $2;',
  values: ['john', 25],
}
*/

```
