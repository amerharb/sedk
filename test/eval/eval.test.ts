import * as sedk from '../../src'
import { database } from '../database'
import * as fs from 'fs'

/** Aliases: they are used inside eval code */
const AND = sedk.LogicalOperator.AND
const OR = sedk.LogicalOperator.OR
const ADD = sedk.ArithmeticOperator.ADD
const SUB = sedk.ArithmeticOperator.SUB
const MUL = sedk.ArithmeticOperator.MUL
const DIV = sedk.ArithmeticOperator.DIV
const MOD = sedk.ArithmeticOperator.MOD
const EXP = sedk.ArithmeticOperator.EXP
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col2 = table1.c.col2
const col3 = table1.c.col3
const col4 = table1.c.col4
const col5 = table1.c.col5
const col6 = table1.c.col6
const col7 = table1.c.col7
const col8 = table1.c.col8

describe('eval', () => {
	const sql = new sedk.Builder(database)
	afterEach(() => {
		sql.cleanUp()
	})
	describe('tests.csv', () => {
		const file = fs.readFileSync('test/eval/tests.csv', 'utf8')
		const codeCypherArray = parseInputFile(file)
		codeCypherArray.forEach(line => {
			it(`Produce: [${line.sql}] for: <${line.code}>`, () => {
				const actual = eval(`${line.code}.getSQL()`)
				expect(actual).toBe(line.sql)
			})
		})
	})
})

type CodeCypher = { code: string, sql: string }

function parseInputFile(file: string): CodeCypher[] {
	const blocks = file.split(/[\r?\n]{2,}/g)
	return blocks.map(block => {
		const lines = block.split(/\r?\n/g)
		return { code: lines[0], sql: lines[1] }
	})
}
