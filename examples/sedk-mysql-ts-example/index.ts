import { log } from './util.js'

const examples = [
	'./readme-example.js',
	'./example1.js',
	'./sedk-mysql_v0_0_4.js',
]

async function main() {
	const functions = examples.map((filename) => ({
		filename,
		execFile: async () => await import(filename)
	}))
	for (const fn of functions) {
		log(`📦 run ${fn.filename}`)
		await fn.execFile()
	}
}

log('🚀 Starting sedk-mysql-ts-example ...')
main()
	.then(() => {
		log('')
		log('👋 End of sedk-mysql-ts-example')
	})
