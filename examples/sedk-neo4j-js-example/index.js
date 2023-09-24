const importFunctionsList = [
	async () => await import('./readme-example.js'),
]

async function main() {
	for (const fn of importFunctionsList) {
		console.log(`📦 run ${fn.name}`)
		await fn()
	}
}

console.log('🚀 Starting sedk-neo4j-js-example ...')
main().then(() => {
	console.log('👋 End of sedk-neo4j-js-example')
})
