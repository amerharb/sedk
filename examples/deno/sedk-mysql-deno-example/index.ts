import { log } from './util.ts'

const examples = [
	'./readme-example.ts',
	'./example1.ts',
	'./v0_1_0.ts'
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

log('🚀 Starting sedk-postgres-deno-example ...')
log('')
main().then(() => {
	log('👋 End of sedk-postgres-deno-example')
})
