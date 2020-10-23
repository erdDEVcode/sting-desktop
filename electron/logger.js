const chalk = require('chalk')
const Logger = require('logarama')
const Settings = require('./settings')

const colorMap = {
  trace: 'gray',
  debug: 'magenta',
  info: 'white',
  error: 'redBright',
  warn: 'yellow'
}

const console_log = console.log.bind(console)

const logger = new Logger('Sting-Backend', {
  minLevel: Settings.logLevel,
  output: (level, tag, msg) => {
    // eslint-disable-next-line no-console
    console_log(chalk[colorMap[level]](`${tag}: ${msg}`))
  }
})

console.log = (...args) => {
  logger.debug(...args)
}

module.exports = logger

