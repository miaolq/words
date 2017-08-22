const fs = require('fs');
const http = require('http');
const chalk = require('chalk');
const os = require('os');
const path = require('path');
const directoryPath = path.resolve(os.homedir(), 'translate-wd');
let filePath = path.resolve(os.homedir(), 'translate-wd', 'word.json');
const COUNT = 500; // 超过500个时另起一个文件存储

function fillBlank(str) {
    while (str.length < 6) {
        str += ' ';
    }
    return str;
}

function fillZero(num) {
    if (num < 10) {
        return '0' + num;
    }
    return num;
}

function getDateStr() {
    const now = new Date();
    const year = now.getFullYear();
    const month = fillZero(now.getMonth() + 1);
    const date = fillZero(now.getDate());
    const hour = fillZero(now.getHours());
    const minute = fillZero(now.getMinutes());
    return `${year}-${month}-${date}-${hour}-${minute}`;
}

// 写入JSON
function writeToJson(parts, words) {
    let wordsJson;
    try {
        wordsJson = require(filePath);
    } catch (error) {
        wordsJson = {};
    }
    if (!wordsJson[words]) {
        wordsJson[words] = parts.map(item => {
            const obj = {};
            obj[item.part] = item.means.join(' ');
            return obj;
        })
        if (Object.keys(wordsJson).length >= COUNT) {
            const newFilePath = path.resolve(os.homedir(), 'translate-wd', `word${getDateStr()}.json`);
            fs.renameSync(filePath, newFilePath);
            filePath = newFilePath;
        }
        fs.writeFile(filePath, JSON.stringify(wordsJson), err => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.mkdirSync(directoryPath);
                    fs.writeFileSync(filePath, JSON.stringify(wordsJson))
                }
                else {
                    console.error(err);
                }
            }
        })
    }
}

module.exports = function main(arr) {
    if (arr.length <= 0) {
        return;
    }

    const words = arr.join(' ');
    const url = `http://dict-co.iciba.com/api/dictionary.php?w=${words}&key=7C773756B3D4990BBE0F63B6C5BEA922&type=json`;
    http.get(url, res => {
        if (res.statusCode !== 200) {
            console.error(`Request Failed. Status Code: ${statusCode}`);
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            const parsedData = JSON.parse(rawData);
            const parts = parsedData.symbols[0].parts;
            // 无结果直接返回
            if (!parts) {
                console.log(chalk.red('no results found'));
                return;
            }
            // 控制台输出
            for (const item of parts) {
                console.log(`${chalk.blue(fillBlank(item.part))} ${chalk.yellow(item.means.join(' '))}`)
            }
            writeToJson(parts, words);
        });
    }).on('error', (e) => {
        console.error(`Request Failed. ${e.message}`);
    })

}

// http://dict-co.iciba.com/api/dictionary.php?w=go&key=7C773756B3D4990BBE0F63B6C5BEA922&type=json
// https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh&dt=t&q=${words}
