const importFunctionsList = [
	async () => await import('./readme-example.js'),
	async () => await import('./example1.js'),
]

async function main() {
	for (const fn of importFunctionsList) {
		console.log(`📦 run ${fn.name}`)
		await fn()
	}
}

console.log('🚀 Starting sedk-mysql-ts-example ...')
main().then(() => {
	console.log('👋 End of sedk-mysql-ts-example')
})
