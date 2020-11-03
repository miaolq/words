const { Command } = require('commander')
const chalk = require('chalk')
const nodeFetch = require('node-fetch')
const os = require('os')
const say = require('say')
const fs = require('fs-extra')
const pkg = require('./package.json')
const api = require('./api')

const hostFile = './_local/host'
const tkFile = './_local/tk'
// const host = 'http://106.14.121.159/back'

function fmt(str) {
  while (str.length < 8) {
    str += ' '
  }
  return str
}

async function main() {
  const prog = new Command()
  prog.version(pkg.version)
  prog.option('-w --words <words...>', '单词或句子,句子最好用双引号包裹')
  prog.option('-l --login <login...>', '登录，用户名,密码用空格隔开')
  prog.option('-h --host <host...>', '写入接口地址')
  prog.option('-d --debug', '开启debug')
  prog.parse()

  const options = prog.opts()
  const { words, login, host: hostOption } = options

  const tk = await fs
    .readFile(tkFile)
    .catch(err => console.log(chalk.red(err.message)))
  !tk && console.log(chalk.red('未登录'))
  const host = await fs
    .readFile(hostFile)
    .catch(err => console.log(chalk.red(err.message)))
  !host && console.log(chalk.red('未写入接口地址'))
  global.words = { tk, host }

  if (hostOption) {
    const fd = await fs.open(hostFile, 'w')
    await fs.write(fd, hostOption[0])
    console.log(chalk.blue('写入api成功'))
    return
  }

  if (login && login.length >= 2) {
    console.log(chalk.yellow('login...'))
    api.login(...login)
    return
  }

  if (words === undefined) {
    console.log(chalk.red('输入wd --help查看帮助'))
    return
  }

  handleData(words)
}

function handleData(words) {
  if (words.length === 1) {
    handleWord(words[0])
    return
  }
  handleSentence(words.join(' '))
}

async function handleWord(word) {
  const url = `http://dict-co.iciba.com/api/dictionary.php?w=${word}&key=7C773756B3D4990BBE0F63B6C5BEA922&type=json`
  const data = await nodeFetch(url).then(res => res.json())
  const { exchange, word_name, symbols } = data
  if (!word_name) {
    return console.log(chalk.red(data))
  }

  const { ph_en, ph_am, ph_en_mp3, ph_am_mp3, parts } = symbols[0]
  const phonetic = [
    { area: 'ph_en', ph: ph_en, mp3: ph_en_mp3 },
    { area: 'ph_am', ph: ph_am, mp3: ph_am_mp3 },
  ]
  const { tk, host } = global.words
  tk && host && api.addW({ word, phonetic, exchange, parts })

  let output = `${word} ${chalk.magenta(`英[ ${ph_en} ] 美[ ${ph_am} ]`)}`
  parts.forEach(item => {
    output += `${os.EOL}${chalk.green(fmt(item.part))} ${chalk.yellow(
      item.means.join(' ')
    )}`
  })
  console.log(output)
  say.speak(word)
}

function handleSentence(sentence) {
  const { tk, host } = global.words
  tk && host && api.addS(sentence)
}

main()
