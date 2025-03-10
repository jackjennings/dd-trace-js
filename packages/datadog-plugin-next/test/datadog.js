module.exports = require('../../..').init({
  service: 'test',
  flushInterval: 0,
  plugins: false
}).use('next', process.env.WITH_CONFIG ? {
  blocklist: ["/api/health"],
  validateStatus: code => false,
  hooks: {
    request: (span, req) => {
      span.setTag('req', req.constructor.name)
      span.setTag('foo', 'bar')
    }
  }
} : true).use('http', { client: false })
