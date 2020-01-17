const fs = require('fs');
const path = require('path');
const { COPYFILE_EXCL } = fs.constants;
// 创建文件
const createFile = function(filepath, content, callback) {
    fs.writeFile(filepath, content, {
        encoding: 'utf8',
    }, (err) => {
        if (err) {
            callback(false);
        } else {
            callback(true);
        }
    });
};

const copyFile = function(filepath, targetPath, callback) {
    fs.copyFile(filepath, targetPath, COPYFILE_EXCL, function(err) {
        if (err) {
            callback(false);
        } else {
            callback(true);
        }
    });
};

const copyFolder = function (folderPath, destPath) {
    const folders = getFolderList(folderPath);
    mkdirsFolder(destPath);
    folders.forEach(function (folder) {
        const src = `${folderPath}/${folder}`;
        const dest = `${destPath}/${folder}`;
        // 创建目录
        fs.stat(src, function (err, stats) {
            if (err) throw err;
            if (stats.isDirectory()) {
                mkdirsFolder(dest);
                copyFolder(src, dest);
            } else if (stats.isFile()) {
                copyFile(src, dest, function (flag) {});
            }
        });
    });
}

/**
 * 获取文件内容
 * @param {String} filepath 文件地址
 */
const getFileContent = function (filepath, callback) {
    fs.readFile(filepath, {
        encoding: 'utf8',
    }, function(err, data) {
        if (err) {
            callback('');
        } else {
            callback(data);
        }
    });
};

const getFolderList = function (folderPath) {
    return fs.readdirSync(folderPath, {
        encoding: 'utf8',
    });
};

const mkdirsFolder = function (folderPath) {
    if (fs.existsSync(folderPath)) {
        return true;
    } else {
        if (mkdirsFolder(path.dirname(folderPath))) {
            fs.mkdirSync(folderPath, { recursive: true });
            return true;
        }
    }
};

const getQuestionFolderList = function (folderPath) {
    const list = getFolderList(folderPath);
    let result = [];
    for (let i = 0; i < list.length; i++) {
        result.push({
            name: list[i],
            value: list[i],
        });
    }
    return result;
}

module.exports = {
    createFile,
    copyFile,
    copyFolder,
    getFileContent,
    mkdirsFolder,
    getFolderList,
    getQuestionFolderList,
};
