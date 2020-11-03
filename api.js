const nodeFetch = require('node-fetch')
const fs = require('fs-extra')
const chalk = require('chalk')

const tkFile = './_tk'

function logRes(res, url = '') {
  const { code, message } = res
  if (code !== 0) {
    console.log(chalk.red(message || 'error', url))
  }
}

const fetch = async (...o) => {
  const res = await nodeFetch(...o).then(res => res.json())
  logRes(res, o[0])
  return res
}

exports.login = async (account, passwd, expires = 7) => {
  const { host } = global.words
  return fetch(`${host}/user/login`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account, passwd, expires }),
  }).then(async res => {
    const { code, data } = res
    console.log(res)
    if (code !== 0) return
    const fd = await fs.open(tkFile, 'w')
    await fs.write(fd, data.tk)
    console.log(chalk.blue('login success'))
  })
}

exports.addS = async s => {
  const { tk, host } = global.words
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
  const { tk, host } = global.words
  return fetch(`${host}/word`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tk}`,
    },
    body: JSON.stringify(w),
  })
}
