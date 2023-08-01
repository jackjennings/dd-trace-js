'use strict'

const {
  FakeAgent,
  createSandbox,
  curlAndAssertMessage,
  checkSpansForServiceName,
  skipUnsupportedNodeVersions,
  spawnPluginIntegrationTestProc
} = require('../../../../integration-tests/helpers')
const { assert } = require('chai')

const describe = skipUnsupportedNodeVersions()

describe('esm', () => {
  let agent
  let proc
  let sandbox

  before(async function () {
    this.timeout(20000)
    // TODO: Figure out why 10.x tests are failing.
    console.log(1)
    sandbox = await createSandbox(['next', 'react', 'react-dom'], false,
      ['./packages/datadog-plugin-next/test/*'])
    console.log(33223)
    console.log(sandbox)
  })

  after(async () => {
    console.log(2)
    await sandbox.remove()
  })

  beforeEach(async () => {
    console.log(3)
    agent = await new FakeAgent().start()
  })

  afterEach(async () => {
    console.log(5)
    proc && proc.kill()
    await agent.stop()
  })

  context('next', () => {
    it('is instrumented', async () => {
      console.log(4)
      proc = await spawnPluginIntegrationTestProc(sandbox.folder, 'integration-test/server.mjs', agent.port)

      return curlAndAssertMessage(agent, proc, ({ headers, payload }) => {
        assert.propertyVal(headers, 'host', `127.0.0.1:${agent.port}`)
        assert.isArray(payload)
        assert.strictEqual(checkSpansForServiceName(payload, 'next.request'), true)
      })
    }).timeout(20000)
  })
})
