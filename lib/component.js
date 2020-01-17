// 1. 检测components文件夹是否存在，不存在提示创建，或者是否在项目目录下
// 2. 生成组件的文件夹
// 3. 生成组件文件
// 4. 检测所有组件列表，选择可用组件，直接添加到文件中
const path = require('path');
const fs = require('fs');
// 交互式命令界面
const inquirer = require('inquirer');
const cwd = process.cwd();
const { createFile, copyFile, getFileContent, mkdirsFolder, getQuestionFolderList } = require('./utils');
const logger = require('./logger');

const componentJsonFile = function (name, list=[], folderPath) {
    const tempFilePath = path.resolve(__dirname, '../template/component.json');
    getFileContent(tempFilePath, function (data) {
        if (data) {
            const content = JSON.parse(data);
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                content.usingComponents[item] = `/components/${name}/${name}`;
            }
            createFile(`${folderPath}/${name}.json`, JSON.stringify(content, null, '\t'), function (flag) {
                flag && logger.success(`生成 ${name}.json 成功`);
            });
        }
    });
};

// 处理组件相关的操作
module.exports = function(args) {
    const componentName = args[3] || '';
    const pathValue = path.join(cwd, './components');
    if (!fs.existsSync(pathValue)) {
        // 存在，直接输入错误信息，并返回
        logger.error('创建出错', ' components 目录不存在');
        return;
    }
    const componentList = getQuestionFolderList(pathValue);
    const questions = [];
    if (!componentName) {
        questions.push({
            type: 'input',
            name: 'name',
            message: '组件名称:',
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
        const componentPath = `${pathValue}/${name}`;
        const templatePath = path.resolve(__dirname, '../template');
        // 生成目录
        mkdirsFolder(componentPath);
        // 生成文件
        copyFile(`${templatePath}/component.js`, `${componentPath}/${name}.js`, function(flag) {
            flag && logger.success(`生成 ${name}.js 成功`);
        });
        createFile(`${componentPath}/${name}.wxss`, '', function (flag) {
            flag && logger.success(`生成 ${name}.wxss 成功`);
        });
        createFile(`${componentPath}/${name}.wxml`, '', function (flag) {
            flag && logger.success(`生成 ${name}.wxml 成功`);
        });
        // @ts-ignore
        componentJsonFile(name, components, componentPath);
    });
};