import { log } from './util.js';

const importFunctionsList = [
	async () => await import('./readme-example.js'),
	async () => await import('./example1.js'),
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
