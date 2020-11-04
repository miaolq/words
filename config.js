const os = require('os')
const fs = require('fs-extra')
const chalk = require('chalk')
const pkg = require('./package.json')

const configFile = `${os.homedir()}/.${pkg.name}/config.json`

fs.ensureFileSync(configFile)
let config = fs.readJSONSync(configFile, { throws: false })

if (!config) {
  config = {
    version: pkg.version,
    tk: '',
    host: '',
  }
}

const writeConfig = data => {
  fs.writeJSONSync(configFile, data)
  console.log(chalk.blue('写入成功'))
}

module.exports = {
  config,
  writeConfig,
}
