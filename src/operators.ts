export enum NullOperator {
	Is = 'IS',
	IsNot = 'IS NOT',
}

export enum ComparisonOperator {
	Equal = '=',
	NotEqual = '<>',
	GreaterThan = '>',
	GreaterOrEqual = '>=',
	LesserThan = '<',
	LesserOrEqual = '<=',
	In = 'IN',
	NotIn = 'NOT IN',
}

export type Qualifier = NullOperator|ComparisonOperator

export enum ArithmeticOperator {
	ADD = '+',
	SUB = '-',
	MUL = '*',
	DIV = '/',
	MOD = '%',
	EXP = '^',
}

export enum BitwiseOperator {
	BitwiseOr = '|',
	BitwiseAnd = '&',
	BitwiseXor = '#',
}

export enum TextOperator {
	CONCAT = '||',
}

export type Operator = Qualifier|ArithmeticOperator|BitwiseOperator|TextOperator

export enum LogicalOperator {
	AND = 'AND',
	OR = 'OR',
}

export function isComparisonOperator(operator: Operator): operator is ComparisonOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(ComparisonOperator).includes(operator)
}

export function isArithmeticOperator(operator: Operator): operator is ArithmeticOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(ArithmeticOperator).includes(operator)
}

export function isBitwiseOperator(operator: Operator): operator is BitwiseOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(BitwiseOperator).includes(operator)
}

export function isTextOperator(operator: Operator): operator is TextOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(TextOperator).includes(operator)
}

export function isNullOperator(operator: Operator): operator is NullOperator {
	// @ts-ignore - the type of operator can be other operator
	return Object.values(NullOperator).includes(operator)
}
