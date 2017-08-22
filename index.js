const fs = require('fs');
const http = require('http');
const chalk = require('chalk');
let wordsJson = {};
try {
    wordsJson = require(`${__dirname}/words.json`);
} catch (error) {
    //
}

function fillBlank(str) {
    while (str.length < 6) {
        str += ' ';
    }
    return str;
}

module.exports = function main(arr) {
    if (arr.length <= 0) {
        return;
    }
    const words = arr.join(' ');
    http.get(`http://dict-co.iciba.com/api/dictionary.php?w=${words}&key=7C773756B3D4990BBE0F63B6C5BEA922&type=json`, res => {
        if (res.statusCode !== 200) {
            let error = new Error(`Request Failed. Status Code: ${statusCode}`);
            console.error(error.message);
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                const parts = parsedData.symbols[0].parts || [];
                if (parts.length <= 0) {
                    console.log(chalk.red('no results found'));
                    return;
                }
                for (const item of parts) {
                    console.log(`${chalk.blue(fillBlank(item.part))} ${chalk.yellow(item.means.join(' '))}`)
                }
                // 写入json
                if (!wordsJson[words]) {
                    wordsJson[words] = parts.map(item => {
                        const obj = {};
                        obj[item.part] = item.means.join(' ');
                        return obj;
                    })
                    fs.writeFile(`${__dirname}/words.json`, JSON.stringify(wordsJson), err => {
                        if (err) {
                            console.error(err);
                        }
                    })
                }
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    })

}

// http://dict-co.iciba.com/api/dictionary.php?w=go&key=7C773756B3D4990BBE0F63B6C5BEA922&type=json
// https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh&dt=t&q=${words}
