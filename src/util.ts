import { BaseStep, DeleteStep, DeleteWhereStep } from './steps'

export function escapeDoubleQuote(source: string): string {
	return source.replace(/"/g, '""')
}

function escapeSingleQuote(source: string): string {
	return source.replace(/'/g, "''")
}

export function getStmtNull(): string {
	return 'NULL'
}

export function getStmtBoolean(value: boolean): string {
	return value ? 'TRUE' : 'FALSE'
}

export function getStmtString(value: string): string {
	return `'${escapeSingleQuote(value)}'`
}

export function getStmtDate(value: Date): string {
	return `'${escapeSingleQuote(value.toISOString())}'`
}

export function isDeleteStep(step: BaseStep): step is DeleteStep {
	return step instanceof DeleteStep
}

export function isDeleteWhereStep(step: BaseStep): step is DeleteWhereStep {
	return step instanceof DeleteWhereStep
}
