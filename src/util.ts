export function escapeDoubleQuote(source:string): string {
  return source.replace(/"/g, '""')
}
