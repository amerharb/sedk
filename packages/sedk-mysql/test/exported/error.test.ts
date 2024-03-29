import {
	$,
	ALL,
	ASC,
	ASTERISK,
	ArithmeticOperator,
	ColumnNotFoundError,
	ComparisonOperator,
	DESC,
	DISTINCT,
	EmptyArrayError,
	InsertColumnsAndExpressionsNotEqualError,
	InsertColumnsAndValuesNotEqualError,
	InvalidConditionError,
	InvalidExpressionError,
	MoreThanOneDistinctOrAllError,
	NULLS_FIRST,
	NULLS_LAST,
	Schema,
	Table,
	TableNotFoundError,
	TextColumn,
	builder,
	e,
	f,
} from 'sedk-mysql'
import { database } from '@test/database'

//Alias
const ADD = ArithmeticOperator.ADD
const GT = ComparisonOperator.GreaterThan
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col2 = table1.c.col2
const col3 = table1.c.col3
const col4 = table1.c.col4
const table2 = database.s.public.t.table2
const table3 = database.s.public.t.table3

describe('Throw desired Errors', () => {
	const sql = builder(database)

	describe('Error: InvalidExpressionError', () => {
		it('Throws error when add invalid operator', () => {
			function actual() {
				sql.select(e(1, GT, 'f'))
			}

			expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator ">"')
			expect(actual).toThrowError(InvalidExpressionError)
		})
		it('Throws error if number added to text', () => {
			function actual() {
				sql.select(e(1, ADD, 'a')).getSQL()
			}

			expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator "+"')
			expect(actual).toThrowError(InvalidExpressionError)
		})
	})

	describe('Error: MoreThanOneDistinctOrAllError', () => {
		it('Throws error when more than one DISTINCT passed', () => {
			function actual() {
				// @ts-ignore
				sql.select(DISTINCT, DISTINCT, col1).from(table1)
			}

			expect(actual).toThrow(/^You can not have more than one DISTINCT or ALL$/)
			expect(actual).toThrow(MoreThanOneDistinctOrAllError)
		})
		it('Throws error when more than one ALL passed', () => {
			function actual() {
				// @ts-ignore
				sql.select(ALL, ALL, col1).from(table1)
			}

			expect(actual).toThrow(/^You can not have more than one DISTINCT or ALL$/)
			expect(actual).toThrow(MoreThanOneDistinctOrAllError)
		})
		it('Throws error when DISTINCT and ALL passed', () => {
			// @ts-ignore
			function actual1() { sql.select(ALL, col1, DISTINCT).from(table1) }

			// @ts-ignore
			function actual2() { sql.select(ALL, DISTINCT, col1).from(table1) }

			// @ts-ignore
			function actual3() { sql.select(DISTINCT, ALL, col1).from(table1) }

			// @ts-ignore
			function actual4() { sql.select(DISTINCT, col1, ALL).from(table1) }

			[actual1, actual2, actual3, actual4].forEach(actual => {
				expect(actual).toThrow(/^You can not have more than one DISTINCT or ALL$/)
				expect(actual).toThrow(MoreThanOneDistinctOrAllError)
			})
		})
	})

	describe('Error: InvalidConditionError', () => {
		it(`Throws error when condition created with "NUMBER" "=" "TEXT"`, () => {
			function actual() {
				sql
					.selectAsteriskFrom(table1)
					.where(col4.bitwiseXor(1).eq('A'))
					.getSQL()
			}

			expect(actual).toThrow(InvalidConditionError)
			expect(actual).toThrow(`Condition can not created with "NUMBER" "=" "TEXT"`)
		})
		it(`Throws error when condition created with "NUMBER" "=" "DATE"`, () => {
			function actual() {
				sql
					.selectAsteriskFrom(table1)
					.where(col4.bitwiseXor(1).eq(new Date()))
					.getSQL()
			}

			expect(actual).toThrow(InvalidConditionError)
			expect(actual).toThrow(`Condition can not created with "NUMBER" "=" "DATE"`)
		})
		it(`Throws no error when condition created with "NUMBER" "=" "NUMBER"`, () => {
			function actual() {
				sql
					.selectAsteriskFrom(table1)
					.where(col4.bitwiseXor(1).eq(1))
					.getSQL()
			}

			expect(actual).not.toThrow()
		})
	})

	it('Throws error when column not exist', () => {
		const wrongColumn = new TextColumn({ name: 'wrongColumn' })

		function actual() {
			sql.select(col1, wrongColumn, col3)
		}

		expect(actual).toThrowError('Column: "wrongColumn" not found')
		expect(actual).toThrowError(ColumnNotFoundError)
	})

	it('Throws error when table1 not exist', () => {
		const wrongTable = new Table({ name: 'wrongTable', columns: { anyColumn: new TextColumn({ name: 'anyColumn' }) } })

		function actual() {
			sql.select(col1).from(wrongTable)
		}

		expect(actual).toThrowError('Table: "wrongTable" not found')
		expect(actual).toThrowError(TableNotFoundError)
	})

	it('Throws error when no param to select passed after DISTINCT', () => {
		function actual() {
			sql.select(DISTINCT).from(table1)
		}

		expect(actual).toThrow(/^Select step must have at least one parameter after DISTINCT$/)
	})

	it('Throws error when ORDER BY has no param', () => {
		function actual() {
			sql
				.selectAsteriskFrom(table1)
				.orderBy()
		}

		expect(actual).toThrow(/^Order by should have at lease one item$/)
	})

	it('Throws error when DESC comes before alias or column', () => {
		function actual() {
			sql
				.selectAsteriskFrom(table1)
				.orderBy(DESC, 'col1')
		}

		expect(actual).toThrow(/^ DESC expects to have column or alias before it$/)
	})

	it('Throws error when NULLS FIRST comes before alias or column', () => {
		function actual() {
			sql
				.selectAsteriskFrom(table1)
				.orderBy(NULLS_FIRST, col1)
		}

		expect(actual).toThrow(/^ NULLS FIRST expects to have column or alias before it$/)
	})

	it('Throws error when DESC comes after NULLS_FIRST', () => {
		function actual() {
			sql
				.selectAsteriskFrom(table1)
				.orderBy(col1, NULLS_FIRST, DESC)
		}

		expect(actual).toThrow(/^ DESC expects to have column or alias before it$/)
	})

	it('Throws error when NULLS_LAST comes directly after NULLS_FIRST', () => {
		function actual() {
			sql.selectAsteriskFrom(table1).orderBy(col1, NULLS_FIRST, NULLS_LAST)
		}

		expect(actual).toThrow(/^ NULLS LAST expects to have column or alias before it$/)
	})

	it('Throws error when DESC comes directly after ASC', () => {
		function actual() {
			sql.selectAsteriskFrom(table1).orderBy(col1, ASC, DESC)
		}

		expect(actual).toThrow(/^ DESC shouldn't come after "ASC" or "DESC" without column or alias in between$/)
	})

	it('Throws error "Expression Type must be number in aggregate function"', () => {
		function actual() {
			sql
				.select(col1)
				.from(table1)
				.groupBy(col1)
				.having(f.sum(e('text')).eq(4))
				.getSQL()
		}

		expect(actual).toThrow(/^Expression Type must be number in aggregate function$/)
	})

	describe('Error: InsertColumnsAndValuesNotEqualError', () => {
		describe('Table and columns one step', () => {
			it(`columns more than values`, () => {
				function actual() {
					sql.insertInto(table1, col1, col2).values('A')
				}

				expect(actual).toThrow(InsertColumnsAndValuesNotEqualError)
			})
			it(`values more than columns`, () => {
				function actual() {
					sql.insertInto(table1, col1, col2).values('A', 'B', 'C')
				}

				expect(actual).toThrow(InsertColumnsAndValuesNotEqualError)
			})
			it(`won't throw when values equal columns`, () => {
				function actual() {
					sql.insertInto(table1, col1, col2).values('A', 'B')
				}

				expect(actual).not.toThrow(InsertColumnsAndValuesNotEqualError)
			})
		})
		describe('Table and columns two steps', () => {
			it(`columns more than values`, () => {
				function actual() {
					sql.insertInto(table1)(col1, col2).values('A')
				}

				expect(actual).toThrow(InsertColumnsAndValuesNotEqualError)
			})
			it(`values more than columns`, () => {
				function actual() {
					sql.insertInto(table1)(col1, col2).values('A', 'B', 'C')
				}

				expect(actual).toThrow(InsertColumnsAndValuesNotEqualError)
			})
			it(`won't throw when values equal columns`, () => {
				function actual() {
					sql.insertInto(table1)(col1, col2).values('A', 'B')
				}

				expect(actual).not.toThrow(InsertColumnsAndValuesNotEqualError)
			})
		})
		describe('Table only', () => {
			it(`columns more than values`, () => {
				function actual() {
					sql.insertInto(table2).values('A')
				}

				expect(actual).toThrow(InsertColumnsAndValuesNotEqualError)
			})
			it(`values more than columns`, () => {
				function actual() {
					sql.insertInto(table2).values('A', 'B', 'C')
				}

				expect(actual).toThrow(InsertColumnsAndValuesNotEqualError)
			})
			it(`won't throw when values equal columns`, () => {
				function actual() {
					sql.insertInto(table2).values('A', 'B')
				}

				expect(actual).not.toThrow(InsertColumnsAndValuesNotEqualError)
			})
		})
		describe('Table only two steps', () => {
			it(`throw when columns more than values`, () => {
				function actual() {
					sql.insertInto(table2)().values('A')
				}

				expect(actual).toThrow('IntoColumnsStep must have at least one column')
			})
			it(`throw when values more than columns`, () => {
				function actual() {
					sql.insertInto(table2)().values('A', 'B', 'C')
				}

				expect(actual).toThrow('IntoColumnsStep must have at least one column')
			})
			it(`throw when values equal columns`, () => {
				function actual() {
					sql.insertInto(table2)().values('A', 'B')
				}

				expect(actual).toThrow('IntoColumnsStep must have at least one column')
			})
			it(`Throws: "Number of values does not match number of columns. Columns: 2, Values: 1"`, () => {
				function actual() {
					sql.insertInto(table2).values('A', 'B')('a')
				}

				expect(actual).toThrow('Number of values does not match number of columns. Columns: 2, Values: 1')
			})
			it(`Throws: "Number of values does not match number of columns. Columns: 2, Values: 3"`, () => {
				function actual() {
					sql.insertInto(table2).values('A', 'B')('a', 'b')('x', 'y', 'z')
				}

				expect(actual).toThrow('Number of values does not match number of columns. Columns: 2, Values: 3')
			})
			it(`Throws: "ValuesStep step must have at least one value"`, () => {
				function actual() {
					sql.insertInto(table2).values('A', 'B')('a', 'b')()
				}

				expect(actual).toThrow('ValuesStep step must have at least one value')
			})
		})
	})
	describe('Error: InsertColumnsAndExpressionsNotEqualError', () => {
		describe('Table and columns one step', () => {
			it(`columns more than expressions`, () => {
				function actual() {
					sql.insertInto(table1, col1, col2).select('A')
				}

				expect(actual).toThrow(InsertColumnsAndExpressionsNotEqualError)
			})
			it(`expressions more than columns`, () => {
				function actual() {
					sql.insertInto(table1, col1, col2).select('A', 'B', 'C')
				}

				expect(actual).toThrow(InsertColumnsAndExpressionsNotEqualError)
			})
			it(`won't throw for expressions equal columns`, () => {
				function actual() {
					sql.insertInto(table2, col1, col2).select('A', 'B')
				}

				expect(actual).not.toThrow(InsertColumnsAndExpressionsNotEqualError)
			})
		})
		describe('Table and columns two steps', () => {
			it(`columns more than expressions`, () => {
				function actual() {
					sql.insertInto(table1)(col1, col2).select('A')
				}

				expect(actual).toThrow(InsertColumnsAndExpressionsNotEqualError)
			})
			it(`expressions more than columns`, () => {
				function actual() {
					sql.insertInto(table1)(col1, col2).select('A', 'B', 'C')
				}

				expect(actual).toThrow(InsertColumnsAndExpressionsNotEqualError)
			})
			// TODO: Currently the expected behavior is not to throw an error when use ASTERISK, later this should change.
			it(`Not throw error when use Asterisk`, () => {
				function actual() {
					sql
						.insertInto(table2)(col1)
						.select(ASTERISK)
						.from(table3)
				}

				expect(actual).not.toThrow(InsertColumnsAndExpressionsNotEqualError)
				expect(actual).not.toThrow(`Number of expressions in Select does not match number of columns. Columns: 1, Expressions: 2`)
			})
			it(`Throw error when number of columns and TableAsterisk not match number`, () => {
				function actual() {
					sql
						.insertInto(table2)(col1)
						.select(table3.ASTERISK)
						.from(table3)
				}

				expect(actual).toThrow(InsertColumnsAndExpressionsNotEqualError)
				expect(actual).toThrow(`Number of expressions in Select does not match number of columns. Columns: 1, Expressions: 2`)
			})
			it(`won't throw for expressions equal columns`, () => {
				function actual() {
					sql.insertInto(table2)(col1, col2).select('A', 'B')
				}

				expect(actual).not.toThrow(InsertColumnsAndExpressionsNotEqualError)
			})
		})
		describe('Table only', () => {
			it(`expressions more than columns`, () => {
				function actual() {
					sql.insertInto(table2).select('A', 'B', 'C')
				}

				expect(actual).toThrow(InsertColumnsAndExpressionsNotEqualError)
			})
			it(`expressions less than columns`, () => {
				function actual() {
					sql.insertInto(table2).select('A')
				}

				expect(actual).toThrow(InsertColumnsAndExpressionsNotEqualError)
			})
			it(`won't throw for expressions equal columns`, () => {
				function actual() {
					sql.insertInto(table2).select('A', 'B')
				}

				expect(actual).not.toThrow(InsertColumnsAndExpressionsNotEqualError)
			})
		})
		describe('Table only two steps', () => {
			it(`throws for expressions more than columns`, () => {
				function actual() {
					sql.insertInto(table2)().select('A', 'B', 'C')
				}

				expect(actual).toThrow('IntoColumnsStep must have at least one column')
			})
			it(`throws for expressions less than columns`, () => {
				function actual() {
					sql.insertInto(table2)().select('A')
				}

				expect(actual).toThrow('IntoColumnsStep must have at least one column')
			})
			it(`throws for expressions equal columns`, () => {
				function actual() {
					sql.insertInto(table2)().select('A', 'B')
				}

				expect(actual).toThrow('IntoColumnsStep must have at least one column')
			})
		})
	})
	describe('Error: EmptyArrayError', () => {
		it(`IN Operator's array cannot be empty`, () => {
			function actual() {
				sql.selectAsteriskFrom(table1).where(col1.in$())
			}

			expect(actual).toThrow(EmptyArrayError)
			expect(actual).toThrow(`IN Operator's array cannot be empty`)
		})
	})
	describe('Error: Binder', () => {
		it(`Throws: You can't getStmt() from this binder, The binder is not stored and has undefined "No"`, () => {
			const binder = $('value')

			expect(() => binder.getStmt()).toThrow(`You can't getStmt() from this binder, The binder is not stored and has undefined "No"`)
		})
	})
	describe('Error: Schema', () => {
		it(`Throws: "Database can only be assigned one time"`, () => {
			const actual = () => {
				const schema = new Schema({ name: 'public', tables: {} })
				schema.database = database
				schema.database = database // <-- This line throws
			}
			expect(actual).toThrow(`Database can only be assigned one time`)
		})
		it(`Throws: "Database is undefined"`, () => {
			const actual = () => {
				const schema = new Schema({ name: 'public', tables: {} })
				schema.database // <-- This line throws
			}
			expect(actual).toThrow(`Database is undefined`)
		})
	})
	describe('Error: Table', () => {
		it(`Throws: "Schema can only be assigned one time"`, () => {
			const actual = () => {
				const table1 = new Table({ name: 'table1', columns: {} })
				table1.schema = new Schema({ name: 'public', tables: { table1 } }) // <-- This line throws
			}
			expect(actual).toThrow(`Schema can only be assigned one time`)
		})
		it(`Throws: "Schema is undefined"`, () => {
			const actual = () => {
				const table = new Table({ name: 'table', columns: {} })
				table.schema // <-- This line throws
			}
			expect(actual).toThrow(`Schema is undefined`)
		})
		it(`Throws: "Schema is undefined" when calling getStmt() before assigning schema to table`, () => {
			const actual = () => {
				const table = new Table({ name: 'table', columns: {} })
				// @ts-ignore
				table.getStmt() // <-- This line throws
			}
			expect(actual).toThrow(`Schema is undefined`)
		})
	})
	describe('Step', () => {
		it(`Throws: "No tables specified"`, () => {
			const actual = () => {
				// @ts-ignore - selectAsteriskFrom() needs at least one table
				sql.selectAsteriskFrom()
			}
			expect(actual).toThrow(`No tables specified`)
		})
	})
	it(`Throws error "Value step has Unsupported value: x, type: y"`, () => {
		const value = { unsupportedObject: 'something' }

		function actual() {
			// @ts-ignore
			sql.insertInto(table1, col1).values(value).getSQL()
		}

		expect(actual).toThrow(`Value step has Unsupported value: ${value}, type: ${typeof value}`)
	})
	it(`Throws "VALUES step must have at least one value"`, () => {
		function actual() {
			// @ts-ignore
			sql.insertInto(table1).values()
		}

		expect(actual).toThrow(`Array must have at least one element`)
	})
	it(`Throws "Invalid empty SELECT step" for empty select step`, () => {
		function actual() {
			sql.insertInto(table1).select().getSQL()
		}

		expect(actual).toThrow(`Invalid empty SELECT step`)
	})
})
