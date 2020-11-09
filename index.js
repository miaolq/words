const { Command } = require('commander')
const chalk = require('chalk')
const nodeFetch = require('node-fetch')
const os = require('os')
const say = require('say')
const pkg = require('./package.json')
const api = require('./api')
const { writeConfig, config } = require('./config')

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
  prog.option('--login <login...>', '登录，用户名,密码用空格隔开')
  prog.option('--host <host...>', '写入接口地址')
  prog.option('-t --todo <todo...>', '待办事项')
  prog.option('--time <time...>', '时间YY-MM-DD')
  prog.option('--priority <priority>', '优先级,1优先级最高')
  prog.option('--tags <tags...>', '标签')
  prog.option('-d --debug', '开启debug')
  prog.parse()

  const options = prog.opts()
  let { words, login, host: hostOption, todo, time, priority, tags } = options
  words = words || prog.args

  if (hostOption) {
    config.host = hostOption[0]
    writeConfig(config)
    return
  }

  if (login && login.length >= 2) {
    console.log(chalk.yellow('login...'))
    api.login(...login)
    return
  }

  if (todo) {
    time = time.join(' ')
    api.addTodo({ todo, priority, time, tags })
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
  api.addW({ word, phonetic, exchange, parts })

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
  api.addS(sentence)
}

main()
