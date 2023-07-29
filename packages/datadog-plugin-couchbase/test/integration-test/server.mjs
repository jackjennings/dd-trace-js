import 'dd-trace/init.js'
import { connect } from 'couchbase'

async function main () {
  const cluster = await connect(
    'couchbase://127.0.0.1',
    {
      username: 'Administrator',
      password: 'password'
    })

  const bucket = cluster.bucket('datadog-test')
  const coll = bucket.defaultCollection()
  await coll.upsert('testdoc', { name: 'Frank' })
}

main().then((_) => {}).catch((err) => {})
