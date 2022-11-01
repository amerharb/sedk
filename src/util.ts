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
