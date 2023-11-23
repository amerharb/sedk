import { log } from './util.js'

const examples = [
	'./readme-example.js',
	'./example1.js',
]

async function main() {
	const functions = examples.map((filename) => ({
		filename,
		execFile: async () => await import(filename)
	}))
	for (const fn of functions) {
		log(`📦 run ${fn.filename}`)
		await fn.execFile()
		log('')
	}
}

log('🚀 Starting sedk-postgres-ts-example ...')
log('')
main().then(() => {
	log('👋 End of sedk-postgres-ts-example')
})
