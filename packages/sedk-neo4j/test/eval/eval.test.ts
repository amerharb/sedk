import * as sedk from '../../src'
import { database } from '../database'
import * as fs from 'fs'

/** Aliases: they are used inside eval code */
const Person = database.Labels.Person
const Animal = database.Labels.Animal
const n = new sedk.Variable('n')
const ASTERISK = sedk.ASTERISK

describe('eval', () => {
	const cypher = sedk.builder()
	describe('tests.csv', () => {
		const file = fs.readFileSync('test/eval/tests.csv', 'utf8')
		const codeCypherArray = parseInputFile(file)
		codeCypherArray.forEach(line => {
			it(`Produce: [${line.cypher}] for: <${line.code}>`, () => {
				const actual = eval(line.code)
				expect(actual).toBe(line.cypher)
			})
		})
	})
})

type CodeCypher = { code: string, cypher: string }

function parseInputFile(file: string): CodeCypher[] {
	const blocks = file.split(/[\r?\n]{2,}/g)
	return blocks.map(block => {
		const lines = block.split(/\r?\n/g)
		return { code: lines[0], cypher: lines[1] }
	})
}
