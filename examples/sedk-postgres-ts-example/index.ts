import { log } from "./util.js";

async function importReadmeExample() {
	return await import('./readme-example.js')
}

async function importExample1() {
	return await import('./example1.js')
}

const importFunctionsList = [
	importReadmeExample,
	importExample1,
]

async function main() {
	for (const fn of importFunctionsList) {
		log(`📦 run ${fn.name}`)
		await fn()
	}
}

log('🚀 Starting sedk-postgres-ts-example ...')
main().then(() => {
	log('👋 End of sedk-postgres-ts-example')
})
