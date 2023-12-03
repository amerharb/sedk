export function log(message: any): void {
	// eslint-disable-next-line no-console
	console.log(message)
}

export function assert(condition: boolean, message: string): void {
	// eslint-disable-next-line no-console
	console.assert(condition, message)
}
