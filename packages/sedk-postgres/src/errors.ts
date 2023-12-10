import { All } from './singletoneConstants.ts'
import { ComparisonOperator } from './operators.ts'

export class ColumnNotFoundError extends Error {
	constructor(columnName: string) {
		super(`Column: "${columnName}" not found in database`)
	}
}

export class TableNotFoundError extends Error {}

export class InvalidExpressionError extends Error {}

export class MoreThanOneDistinctOrAllError extends Error {}

export class InvalidConditionError extends Error {}

export class DeleteWithoutConditionError extends Error {
	constructor() {
		super('Delete statement must have where conditions or set throwErrorIfDeleteHasNoCondition option to false')
	}
}

export class InvalidLimitValueError extends Error {
	constructor(value: null|number|All) {
		super(`Invalid limit value: ${value}, value must be positive number, null or "ALL"`)
	}
}

export class InvalidOffsetValueError extends Error {
	constructor(value: number) {
		super(`Invalid offset value: ${value}, value must be positive number`)
	}
}

export class InsertColumnsAndValuesNotEqualError extends Error {
	constructor(columnsCount: number, valuesCount: number) {
		super()
		this.message = `Number of values does not match number of columns. Columns: ${columnsCount}, Values: ${valuesCount}`
	}
}

export class InsertColumnsAndExpressionsNotEqualError extends Error {
	constructor(columnsCount: number, expressionsCount: number) {
		super()
		this.message = `Number of expressions in Select does not match number of columns. Columns: ${columnsCount}, Expressions: ${expressionsCount}`
	}
}

export class EmptyArrayError extends Error {
	constructor(operator: ComparisonOperator) {
		super()
		this.message = `${operator} Operator's array cannot be empty`
	}
}
