const path = require('path');
const fs = require('fs');
// 交互式命令界面
const inquirer = require('inquirer');
const cwd = process.cwd();
const { createFile, copyFile, getFileContent, mkdirsFolder, getQuestionFolderList } = require('./utils');
const logger = require('./logger');

const pageJsonFile = function (name, list=[], folderPath) {
    const tempFilePath = path.resolve(__dirname, '../template/page.json');
    getFileContent(tempFilePath, function (data) {
        if (data) {
            const content = JSON.parse(data);
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                content.usingComponents[item] = `/components/${item}/${item}`;
            }
            createFile(`${folderPath}/${name}.json`, JSON.stringify(content, null, '\t'), function (flag) {
                flag && logger.success(`生成 ${name}.json 成功`);
            });
        }
    });
}

const updateAppJsonFile = function (name) {
    const appJsonFilePath = path.join(cwd);
    getFileContent(`${appJsonFilePath}/app.json`, function (data) {
        if (data) {
            const content = JSON.parse(data);
            const pageList = content.pages;
            pageList.push(`pages/${name}/${name}`);
            content.pages = pageList;
            createFile(`${cwd}/app.json`, JSON.stringify(content, null, '\t'), function (flag) {
                flag && logger.success(`app.json 文件已经增加 ${name} 页面`);
            });
        }
    });
}

// 处理页面的相关操作
module.exports = function(args) {
    // 新建页面
    // 配置插件
    // 修改app.json文件，添加页面到文件
    const pageName = args[3] || '';
    const pathValue = path.join(cwd, './pages');
    if (!fs.existsSync(pathValue)) {
        // 存在，直接输入错误信息，并返回
        logger.error('创建出错', ' pages 目录不存在');
        return;
    }
    const componentList = getQuestionFolderList(path.join(cwd, './components'));
    const questions = [];
    if (!pageName) {
        questions.push({
            type: 'input',
            name: 'name',
            message: '页面名称(eg: home):',
        });
    }
    if (componentList.length > 0) {
        questions.push({
            type: 'checkbox',
            name: 'components',
            message: '选择使用的组件:',
            choices: componentList,
            default: [],
        });
    }
    inquirer.prompt(questions).then(function (answers) {
        logger.info('回答结果为：', answers);
        const { name, components } = answers;
        const pagePath = `${pathValue}/${name}`;
        const templatePath = path.resolve(__dirname, '../template');
        // 生成目录
        mkdirsFolder(pagePath);
        // 生成文件
        copyFile(`${templatePath}/page.js`, `${pagePath}/${name}.js`, function(flag) {
            flag && logger.success(`生成 ${name}.js 成功`);
        });
        createFile(`${pagePath}/${name}.wxss`, '', function (flag) {
            flag && logger.success(`生成 ${name}.wxss 成功`);
        });
        createFile(`${pagePath}/${name}.wxml`, '', function (flag) {
            flag && logger.success(`生成 ${name}.wxml 成功`);
        });
        // @ts-ignore
        pageJsonFile(name, components, pagePath);
        // 更新 app.json 文件
        updateAppJsonFile(name);
    });
};