import { log } from './util.js'

const examples = [
	'./readme-example.js',
	'./example1.js',
]

async function main() {
	const functions = examples.map((file) => async () => await import(file))
	for (const fn of functions) {
		log(`📦 run ${fn.name}`)
		await fn()
	}
}

log('🚀 Starting sedk-mysql-ts-example ...')
main().then(() => {
	log('👋 End of sedk-mysql-ts-example')
})
