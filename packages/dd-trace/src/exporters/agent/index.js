'use strict'

const { URL, format } = require('url')
const log = require('../../log')
const Writer = require('./writer')

class AgentExporter {
  constructor (config, prioritySampler) {
    this._config = config
    this._waitForAgentInitialization = config.isGCPFunction || config.isAzureFunctionConsumptionPlan
    const { url, hostname, port, lookup, protocolVersion, stats = {} } = config
    this._url = url || new URL(format({
      protocol: 'http:',
      hostname: hostname || 'localhost',
      port
    }))

    const headers = {}
    if (stats.enabled) {
      headers['Datadog-Client-Computed-Stats'] = 'yes'
    }

    this._writer = new Writer({
      url: this._url,
      prioritySampler,
      lookup,
      protocolVersion,
      headers
    })

    this._timer = undefined
    process.once('beforeExit', () => this._writer.flush(this._waitForAgentInitialization))
  }

  setUrl (url) {
    try {
      url = new URL(url)
      this._url = url
      this._writer.setUrl(url)
    } catch (e) {
      log.warn(e.stack)
    }
  }

  export (spans) {
    this._writer.append(spans)

    const { flushInterval } = this._config

    if (flushInterval === 0) {
      this._writer.flush(this._waitForAgentInitialization)
    } else if (flushInterval > 0 && !this._timer) {
      this._timer = setTimeout(() => {
        this._writer.flush(this._waitForAgentInitialization)
        this._timer = clearTimeout(this._timer)
      }, flushInterval).unref()
    }
  }

  flush (done = () => {}) {
    this._writer.flush(this._waitForAgentInitialization, done)
  }
}

module.exports = AgentExporter
