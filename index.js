#! /usr/bin/env node
const { Command } = require('commander');
const pkg = require('./package.json');
const prog = new Command();

prog.version(pkg.version);

prog.option('-w --word <word...>', '单词或句子');

prog.parse();

const options = prog.opts();

const { word } = options; // 加引号很好

console.log(word.join('--'));
