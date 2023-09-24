import { assert, log } from './util.js'
import * as sedk from 'sedk-neo4j'

const database = {
	Labels: {
		Person: new sedk.Label('Person'),
		Animal: new sedk.Label('Animal'),
		Student: new sedk.Label('Student'),
	}
}

//Aliases
const Person = database.Labels.Person
const Student = database.Labels.Student
const ASTERISK = sedk.ASTERISK

const n = new sedk.Variable('n')
const cypher = sedk.builder()

const stmt1 = cypher.match(n, Person).return(n).getCypher()
log(stmt1)
const expt1 = 'MATCH (`n`:`Person`) RETURN `n`'
assert(stmt1 === expt1, 'stmt1 is not as expected')

const stmt2 = cypher.match(n, Person).return(ASTERISK).getCypher()
log(stmt2)
const expt2 = 'MATCH (`n`:`Person`) RETURN *'
assert(stmt2 === expt2, 'stmt2 is not as expected')

const stmt3 = cypher.match(n, Person, Student).return(ASTERISK).getCypher()
log(stmt3)
const expt3 = 'MATCH (`n`:`Person`:`Student`) RETURN *'
assert(stmt3 === expt3, 'stmt3 is not as expected')
