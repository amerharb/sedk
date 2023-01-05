import * as sedk from '../../src'
import { database } from '../database'

// Aliases
const Person = database.Labels.Person
const Animal = database.Labels.Animal
const n = new sedk.Variable('n')
const x = new sedk.Variable('x')
const ASTERISK = sedk.ASTERISK

describe('Step', () => {
	const cypher = sedk.builder()
	describe('simple Cypher', () => {
		it('produces: [] empty string', () => {
			const actual = cypher.getCypher()
			expect(actual).toBe('')
		})
		/** It is not valid cypher stmt, but it is ok to get stmt before the end of chain */
		it('produces: [MATCH (:`Person`)]', () => {
			const actual = cypher.match(Person).getCypher()
			expect(actual).toBe('MATCH (:`Person`)')
		})
		/** It is not valid cypher stmt, but it is ok to get stmt before the end of chain */
		it('produces: [MATCH (`n`:`Person`:`Animal`)]', () => {
			const actual = cypher.match(n, Person, Animal).getCypher()
			expect(actual).toBe('MATCH (`n`:`Person`:`Animal`)')
		})
		it('produces: [MATCH (`n`) RETURN `n`]', () => {
			const actual = cypher.match(n).return(n).getCypher()
			expect(actual).toBe('MATCH (`n`) RETURN `n`')
		})
		it('produces: [MATCH (`n`:`Person`) RETURN `n`]', () => {
			const actual = cypher.match(n, Person).return(n).getCypher()
			expect(actual).toBe('MATCH (`n`:`Person`) RETURN `n`')
		})
		it('produces: [MATCH (`n`:`Person`:`Animal`) RETURN `n`]', () => {
			const actual = cypher.match(n, Person, Animal).return(n).getCypher()
			expect(actual).toBe('MATCH (`n`:`Person`:`Animal`) RETURN `n`')
		})
		it('produces: [MATCH (`n`:`Person`:`Animal`) RETURN *]', () => {
			const actual = cypher.match(n, Person, Animal).return(ASTERISK).getCypher()
			expect(actual).toBe('MATCH (`n`:`Person`:`Animal`) RETURN *')
		})
		it('produces: [MATCH (`n`:`Person`:`Animal`) RETURN `n`, *]', () => {
			const actual = cypher.match(n, Person, Animal).return(n, ASTERISK).getCypher()
			expect(actual).toBe('MATCH (`n`:`Person`:`Animal`) RETURN `n`, *')
		})
	})

	describe('Steps with common parent step', () => {
		it('produces: [MATCH (`n`:`Person`) RETURN `n`] & [MATCH (`n`:`Person`) RETURN *]', () => {
			const match = cypher.match(n, Person)
			const actual1 = match.return(n).getCypher()
			const actual2 = match.return(ASTERISK).getCypher()
			expect(actual1).toBe('MATCH (`n`:`Person`) RETURN `n`')
			expect(actual2).toBe('MATCH (`n`:`Person`) RETURN *')
		})
	})

	describe('Throwing Errors', () => {
		it('throws: No variable or labels provided (match)', () => {
			const actual = () => cypher.match()
			expect(actual).toThrow('No variable or labels provided')
		})
		it('throws: At least one variable must be provided', () => {
			const actual = () => cypher.match(n).return()
			expect(actual).toThrow('At least one variable must be provided')
		})
		it('throws: Asterisk must be the last item', () => {
			// @ts-ignore
			const actual = () => cypher.match(n).return(ASTERISK, n).getCypher()
			expect(actual).toThrow('Asterisk must be the last item')
		})
		it('throws: One or more variables are not in the match clause', () => {
			const actual = () => cypher.match(n).return(x).getCypher()
			expect(actual).toThrow('One or more variables are not in the match clause')
		})
		it('throws: "One or more variables are not in the match clause" for [MATCH (:Person) RETURN n]', () => {
			const actual = () => cypher.match(Person).return(n).getCypher()
			expect(actual).toThrow('One or more variables are not in the match clause')
		})
		it('throws: "Asterisk must be the last item" for [MATCH (n) RETURN (*, x)]', () => {
			// @ts-ignore
			const actual = () => cypher.match(n).return(ASTERISK, x).getCypher()
			expect(actual).toThrow('Asterisk must be the last item')
		})
		it('throws: "Return item duplicated" for [MATCH (n) RETURN n, n]', () => {
			const actual = () => cypher.match(n).return(n, n).getCypher()
			expect(actual).toThrow('Return item duplicated')
		})
		it('throws: "Return item duplicated" for [MATCH (n) RETURN *, *]', () => {
			// @ts-ignore
			const actual = () => cypher.match(n).return(ASTERISK, ASTERISK).getCypher()
			expect(actual).toThrow('Return item duplicated')
		})
		it('throws: "RETURN ASTERISK is not allowed when there are no variables" for [MATCH (:Person) RETURN *]', () => {
			// @ts-ignore
			const actual = () => cypher.match(Person).return(ASTERISK).getCypher()
			expect(actual).toThrow('RETURN ASTERISK is not allowed when there are no variables')
		})
	})
})
