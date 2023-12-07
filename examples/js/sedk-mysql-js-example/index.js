const examples = [
	'./readme-example.js',
	'./example1.js',
	'./sedk-mysql_v0_0_4.js',
	'./v0_1_0.js',
]

async function main() {
	const functions = examples.map((filename) => ({
		filename,
		execFile: async () => await import(filename)
	}))
	for (const fn of functions) {
		console.log(`📦 run ${fn.filename}`)
		await fn.execFile()
	}
}

console.log('🚀 Starting sedk-mysql-js-example ...')
main()
	.then(() => {
		console.log()
		console.log('👋 End of sedk-mysql-js-example')
	})
	.catch((err) => {
		console.log('❌ Error')
		console.error(err)
		process.exit(1)
	})
