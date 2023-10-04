const examples = [
	'./readme-example.js',
	'./example1.js',
]

async function main() {
	const functions = examples.map((file) => async () => await import(file))
	for (const fn of functions) {
		console.log(`📦 run ${fn.name}`)
		await fn()
	}
}

console.log('🚀 Starting sedk-mysql-js-example ...')
main().then(() => {
	console.log('👋 End of sedk-mysql-js-example')
})
