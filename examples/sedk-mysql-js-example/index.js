async function importReadmeExample() {
	await import('./readme-example.js')
}

async function importExample1() {
	await import('./example1.js')
}

const importFunctions = [
	importReadmeExample,
	importExample1,
]

async function main() {
	for (const fn of importFunctions) {
		console.log(`📦 run ${fn.name}`)
		await fn()
	}
}

console.log('🚀 Starting sedk-mysql-js-example ...')
main().then(() => {
	console.log('👋 End of sedk-mysql-js-example')
})
