# SEDK-neo4j
![Version](https://img.shields.io/badge/version-0.0.4-blue.svg)
[![License: GPLv3](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
![Coverage](https://raw.githubusercontent.com/amerharb/sedk/root/version/0.1.2/packages/sedk-neo4j/badges/coverage.svg)
![Github workflow](https://github.com/amerharb/sedk/actions/workflows/test-lint.yaml/badge.svg?branch=main)

SEDK-neo4j is a Cypher builder library for Neo4j, support binding parameters, and use a pre-defined Label and Relation

```typescript
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

const stmt = cypher.match(n, Person).return(n).getCypher()
// MATCH (`n`:`Person`) RETURN `n`
```

## Steps Rail Road
![SEDK steps](https://raw.githubusercontent.com/amerharb/sedk-neo4j/b2d8e81fc8ba1a1f4bc28953abefa9a16e46c87c/doc/StepsRailRoad.svg)

## What is New
### Version 0.0.4
- use A `ASTERISK` in return step
```typescript
cypher.match(n, Person).return(ASTERISK).getCypher()
// MATCH (`n`:`Person`) RETURN *
```
- multi label for the same node
```typescript
cypher.match(n, Person, Student).return(ASTERISK).getCypher()
// MATCH (`n`:`Person`:`Student`) RETURN *
```
- Add backtick to generated label and variable names


### ⚠️IMPORTANT⚠️
 THIS IS STILL A WORK IN PROGRESS FOR PROF OF CONCEPT PROJECT.

 USE IT FOR EDUCATION PURPOSE ONLY.
