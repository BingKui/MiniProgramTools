// 处理项目相关的操作
const path = require('path');
const fs = require('fs');
// 交互式命令界面
const inquirer = require('inquirer');
const cwd = process.cwd();
const { createFile, copyFile, getFileContent, mkdirsFolder, getQuestionFolderList, copyFolder } = require('./utils');
const logger = require('./logger');
// 项目配置打包

// 1. 在项目目录下执行
// 2. 拉取项目页面信息
// 3. 让用户选择
// 4. 根据用户选择的结果生成新的项目，选择目录，默认：‘./dist’
// 5. 遍历所有页面的json配置文件，拿取所有的component，然后移动所有的组件到新的项目
// 6. 移动所有的page到新的项目

const appJsonFile = function (sourceFile, targetFile, pages) {
    getFileContent(sourceFile, function (data) {
        if (data) {
            const content = JSON.parse(data);
            const pagesVal = [];
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                pagesVal.push(`pages/${page}/${page}`);
            }
            createFile(targetFile, JSON.stringify(content, null, '\t'), function (flag) {
                flag && logger.success('打包 app.json');
            });
        }
    });
}

module.exports = function (args) {
    const pagePath = path.join(cwd, './pages');
    const pageList = getQuestionFolderList(pagePath);
    const questions = [];
    questions.push({
        type: 'input',
        name: 'name',
        message: '项目名称：',
    });
    if (pageList.length > 0) {
        questions.push({
            type: 'checkbox',
            name: 'pages',
            message: '选择包含的页面:',
            choices: pageList,
            default: [],
        });
    }
    inquirer.prompt(questions).then(function (answers) {
        logger.info('选择的结果：', answers);
        const { name, pages=[] } = answers;
        const pathValue = path.join(cwd, `./dist/${name}`);
        mkdirsFolder(pathValue);
        // 复制整个 components 文件夹
        copyFolder(path.join(cwd, './components'), `${pathValue}/components`);
        // @ts-ignore
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            copyFolder(path.join(cwd, `./pages/${page}`), `${pathValue}/pages/${page}`);
        }
        // 复制 project.config.json
        copyFile(`${cwd}/project.config.json`, `${pathValue}/project.config.json`, function (flag) {
            flag && logger.success('打包 project.config.json');
        });
        // 复制 sitemap.json
        copyFile(`${cwd}/sitemap.json`, `${pathValue}/sitemap.json`, function (flag) {
            flag && logger.success('打包 sitemap.json');
        });
        // 复制 app.js
        copyFile(`${cwd}/app.js`, `${pathValue}/app.js`, function (flag) {
            flag && logger.success('打包 app.js');
        });
        // 复制 app.wxss
        copyFile(`${cwd}/app.wxss`, `${pathValue}/app.wxss`, function (flag) {
            flag && logger.success('打包 app.wxss');
        });
        // 生成 app.json 文件
        appJsonFile(`${cwd}/app.json`, `${pathValue}/app.json`, pages);
        // 复制公共方法文件夹
        copyFolder(path.join(cwd, `./utils`), `${pathValue}/utils`);
    });
}