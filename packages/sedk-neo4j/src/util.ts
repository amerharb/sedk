
export function escapeBackTick(source: string): string {
	return source.replace(/`/g, '``')
}
