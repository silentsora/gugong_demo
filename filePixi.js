const fs = require('fs');

const path = require('path');
function getAllDirs (mypath = './src/img/sprite') {
    const items = fs.readdirSync(mypath);

    let result = '';
    // 遍历当前目录中所有的文件和文件夹
    let strTemp = function (name) {
        // name2 = name.replace(/img\/sprite\//, '').replace(/(\.png)|(\.jpg)/, '');
        let name1 = name.replace(/src\//, '');
        name2 = name.replace(/src\/img\/sprite\//, '');
        result += `.add('${name2}', require('../../${name1}'))
        `;
    };
    items.map(item => {
        let temp = path.join(mypath, item);

        // 若当前的为文件夹
        if (!fs.statSync(temp).isDirectory()) {
            strTemp(temp); // 存储当前文件夹的名字
        // 进入下一级文件夹访问
        // result = result.concat(getAllDirs(temp));
        }
    });

    return result;
};
fs.writeFile(path.join(path.resolve(__dirname), 'pixi_output.txt'), getAllDirs(), function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('File saved successfully!');
});
