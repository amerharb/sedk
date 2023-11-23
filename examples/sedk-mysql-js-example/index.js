const examples = [
    './readme-example.js',
    './example1.js',
    './sedk-mysql_v0_0_4.js',
]

async function main() {
    const functions = examples.map((file) => async () => await import(file))
    for (const fn of functions) {
        console.log()
        console.log(`📦 run ${fn.name}`)
        await fn()
    }
}

console.log('🚀 Starting sedk-mysql-js-example ...')
main()
    .then(() => {
        console.log()
        console.log('👋 End of sedk-mysql-js-example')
    })
    .catch((err) => {
        console.log('❌ Error')
        console.error(err)
        process.exit(1)
    })
