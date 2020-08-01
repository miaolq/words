const fs = require('fs');
const http = require('http');
const chalk = require('chalk');
const os = require('os');
const path = require('path');
const say = require('say');
const dirPath = path.resolve(os.homedir(), 'translate-wd');
let wordFile = path.resolve(dirPath, 'word.json');
let sentenceFile = path.resolve(dirPath, 'sentence.json');
const COUNT = 100; // 超过100个时另起一个文件存储.
const SentenceNum = 100;

function fmt(str) {
  while (str.length < 8) {
    str += ' ';
  }
  return str;
}

function newFileName(key) {
  return path.resolve(dirPath, `key${Date.now()}.json`);
}

// 写入JSON
function saveWord(word, phonetic, parts) {
  let wordsJson;
  try {
    wordsJson = require(wordFile);
    // 兼容老版本
    if (typeof wordsJson === 'object') {
      wordsJson = Object.entries(wordsJson).map(([key, value]) => ({
        word: key,
        phonetic: '-',
        parts: value,
      }));
    }
  } catch (error) {
    wordsJson = [];
  }
  if (wordsJson.some((item) => item.word === word)) return;

  wordsJson.push({
    word,
    phonetic,
    means: parts.map((item) => ({
      [item.part]: item.means.join(' '),
    })),
  });
  if (wordsJson.length >= COUNT) {
    const newFilePath = newFileName('word');
    fs.renameSync(wordFile, newFilePath);
    wordFile = newFilePath;
  }
  fs.writeFile(wordFile, JSON.stringify(wordsJson), (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.mkdirSync(dirPath);
        fs.writeFileSync(wordFile, JSON.stringify(wordsJson));
      } else {
        console.error(err);
      }
    }
  });
}

function saveSentence(sentence) {
  let json;
  try {
    json = require(sentenceFile);
  } catch (err) {
    json = [];
  }
  if (json.includes(sentence)) {
    return;
  }
  json.push(sentence);
  if (json.length > SentenceNum) {
    const newFilePath = newFileName('sentence');
    fs.renameSync(sentenceFile, newFilePath);
    sentenceFile = newFilePath;
  }
  fs.writeFile(sentenceFile, JSON.stringify(json), (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.mkdirSync(dirPath);
        fs.writeFileSync(sentenceFile, JSON.stringify(json));
      } else {
        console.error(err);
      }
    }
  });
}

module.exports = function main(arr) {
  if (arr.length <= 0) {
    return;
  }

  if (arr.length > 1) {
    return saveSentence(arr.join(' '));
  }

  const words = arr.join(' ');
  const url = `http://dict-co.iciba.com/api/dictionary.php?w=${words}&key=7C773756B3D4990BBE0F63B6C5BEA922&type=json`;
  http
    .get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Request Failed. Status Code: ${statusCode}`);
        res.resume();
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        const parsedData = JSON.parse(rawData);
        const { ph_en, ph_am, parts } = parsedData.symbols[0];
        // 无结果直接返回
        if (!parts) {
          console.log(chalk.red('no results found'));
          return;
        }
        // 控制台输出
        const phonetic = `英[ ${ph_en} ] 美[ ${ph_am} ]`;
        let outPut = `${words}  ${chalk.magenta(phonetic)}`;
        for (const item of parts) {
          // prettier-ignore
          outPut += `${os.EOL}${chalk.green(fmt(item.part))} ${chalk.yellow(item.means.join(' '))}`;
        }
        // 发音
        say.speak(words);
        saveWord(words, phonetic, parts);
      });
    })
    .on('error', (e) => {
      console.error(`Request Failed. ${e.message}`);
    });
};

// http://dict-co.iciba.com/api/dictionary.php?w=go&key=7C773756B3D4990BBE0F63B6C5BEA922&type=json
// https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh&dt=t&q=${words}
