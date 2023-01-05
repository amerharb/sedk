import * as sedk from 'sedk-neo4j'

const database = {
  Labels: {
    Person: new sedk.Label('Person'),
    Animal: new sedk.Label('Animal'),
  }
}

//Aliases
const Person = database.Labels.Person
const Animal = database.Labels.Animal

const n = new sedk.Variable('n')
const cypher = sedk.builder()

const stmt1 = cypher.match(n, Person).return(n).getCypher()
console.log(stmt1)
const expt1 = 'MATCH (`n`:`Person`) RETURN `n`'
console.assert(stmt1 === expt1, 'stmt1 is not as expected')
