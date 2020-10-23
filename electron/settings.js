const { app } = require('electron')
const path = require('path')

const packageJson = require('../package.json')
const buildConfig = require('../buildConfig.json')

const MODE_IS_PRODUCTION = ('prod' === buildConfig.mode)

const argv = require('yargs')
  .usage('Usage: $0 [Meth options]')
  .option({
    mode: {
      demand: false,
      default: buildConfig.mode,
      describe: 'Runtime mode: dev, qa, prod',
      requiresArg: true,
      nargs: 1,
      type: 'string',
      group: 'Meth options:'
    },
    loglevel: {
      demand: false,
      default: MODE_IS_PRODUCTION ? 'warn' : 'debug',
      describe: 'Minimum logging threshold: trace (all logs), debug, info, warn, error.',
      requiresArg: true,
      nargs: 1,
      type: 'string',
      group: 'Meth options:'
    },
    version: {
      alias: 'v',
      demand: false,
      requiresArg: false,
      nargs: 0,
      describe: 'Display Meth version.',
      type: 'boolean',
      group: 'Meth options:'
    }
  })
  .help('h')
  .alias('h', 'help')
  .parse(process.argv.slice(1))



class Settings {
  get appIconPath() {
    return path.join(__dirname, 'images', 'logo.png')
  }

  get userDataDir() {
    // Application Support/Meth
    return app.getPath('userData')
  }

  get appWebDir() {
    return path.resolve(path.join(app.getAppPath(), 'build'))
  }

  get logLevel() {
    return argv.loglevel
  }

  get appVersion() {
    return packageJson.version
  }

  get appName() {
    return packageJson.productName
  }

  get osName() {
    switch (process.platform) {
      case 'darwin':
        return 'mac'
      case 'linux':
        return 'linux'
      case 'win32':
        return 'win'
      default:
        return 'unknown'
    }
  }

  get appConfig() {
    return buildConfig
  }

  get inProductionMode() {
    return buildConfig.mode === 'prod'
  }

  get inDevMode() {
    return buildConfig.mode === 'dev'
  }

  get preloadBasePath() {
    // take into account that win32 uses backslash
    return path.join(__dirname, 'preload').replace(/\\/igm, '/')
  }
}

module.exports = new Settings()
