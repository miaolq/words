const nodeFetch = require('node-fetch')
const chalk = require('chalk')
const { config, writeConfig } = require('./config')
const { tk, host } = config

function logRes(res, url = '') {
  const { code, message } = res
  if (code !== 0) {
    console.log(chalk.red(message || 'error', url))
  }
}

const fetch = async (...o) => {
  if (!host) {
    return console.log('未写入host')
  }
  if (!tk && !o[0].includes('/user/login')) {
    return console.log('未登录')
  }
  const res = await nodeFetch(...o).then(res => res.json())
  logRes(res, o[0])
  return res
}

exports.login = async (account, passwd, expires = 7) => {
  return fetch(`${host}/user/login`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account, passwd, expires }),
  }).then(async res => {
    const { code, data } = res
    if (code !== 0) return
    config.tk = data.tk
    writeConfig(config)
  })
}

exports.addS = async s => {
  return fetch(`${host}/sentence`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tk}`,
    },
    body: JSON.stringify({ content: s }),
  })
}

exports.addW = async w => {
  return fetch(`${host}/word`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tk}`,
    },
    body: JSON.stringify(w),
  })
}
