import { log } from './util.js'

const examples = [
	'./readme-example.js',
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

log('🚀 Starting sedk-neo4j-ts-example ...')
log('')
main().then(() => {
	log('👋 End of sedk-neo4j-ts-example')
})
