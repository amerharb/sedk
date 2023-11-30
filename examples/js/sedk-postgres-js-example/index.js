const examples = [
	'./readme-example.js',
	'./example1.js',
	'./v0_15_1.js',
]

async function main() {
	const functions = examples.map((filename) => ({
		filename,
		execFile: async () => await import(filename)
	}))
	for (const fn of functions) {
		console.log(`📦 run ${fn.filename}`)
		await fn.execFile()
		console.log('')
	}
}

console.log('🚀 Starting sedk-postgres-js-example ...')
console.log('')
main().then(() => {
	console.log('👋 End of sedk-postgres-js-example')
})
