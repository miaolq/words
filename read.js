#! /usr/bin/env node
const { Command } = require('commander');
const prog = new Command();

prog.version('0.0.1');
prog.option('-w --word', 'word to translate');
prog.option('-a --aa', 'a', false); // 无参数
prog.option('-b --bb <name>', 'requireddd'); // 参数必填
prog.option('-d --dd [name]', 'requireddd'); // 参数可选，无参数则true
prog.option('--no-c', 'cc'); // 反选 c默认true，有--no-c则为false
// prog.requiredOption('-e --e <name>'); // 必填
prog.option('-f --f [m...]', 'f'); // 多参数

// 有第二个参数desc，表示参数1是可执行文件默认：parentname-param1
// 否则用.description()
// 改名：executableFile
// const brew = prog.command('brew', 'brewww', { executableFile: './bin/wad' });

// brew.action(opts => {
//   console.log('brewwbrewwbrewwbrewwbreww');
// });

prog.name('my-command').usage('[global options] command');

// console.log(1, prog.opts());
// console.log(2, prog.opts());

prog.parse(process.argv); // 需要在最后

// prog.help();
// prog.brew()
