// 项目初始化
const path = require('path');
const fs = require('fs');
// 交互式命令界面
const inquirer = require('inquirer');
// 命令行loading工具
const ora = require('ora');
const cwd = process.cwd();

const { createFile, copyFile, getFileContent, mkdirsFolder } = require('./utils');
const logger = require('./logger');
const { questions } = require('../constants/init');
const { PLATFORM } = require('../constants/enmu');

// 参数
// 项目名称
// 项目地址
// 项目appid

// 1.创建项目目录
// 2.创建基本文件
// 3.创建目录page、component、utils

const projectJsonFile = function(name, appid, folderPath) {
    const projectVal = path.resolve(__dirname, '../template/project.config.json');
    getFileContent(projectVal, function (data) {
        if (data) {
            const content = JSON.parse(data);
            content.projectname = name;
            content.appid = appid;
            createFile(`${folderPath}/project.config.json`, JSON.stringify(content, null, '\t'), function (flag) {
                flag && logger.success('生成 project.config.json 文件成功~');
            });
        }
    });
}

const appJsonFile = function (name, folderPath) {
    const projectVal = path.resolve(__dirname, '../template/app.json');
    getFileContent(projectVal, function (data) {
        if (data) {
            const content = JSON.parse(data);
            content.pages = ['pages/index/index'];
            content.window.navigationBarTitleText = name;
            createFile(`${folderPath}/app.json`, JSON.stringify(content, null, '\t'), function (flag) {
                flag && logger.success('生成 app.json 文件成功~');
            });
        }
    });
}

module.exports = function (args) {
    const plaform = args[3] || PLATFORM.wx;
    logger.info('开始生成项目~~');
    logger.info('完成以下选项：');
    inquirer.prompt(questions).then(function (answers) {
        logger.info('你的回答结果为：', JSON.stringify(answers));
        // loading
        const spinner = ora('项目生成中...');
        spinner.start();
        const { name, appid, projectPath } = answers;
        // 接收输入的项目名称
        const projectName = name;
        // 重新定义项目的地址
        // @ts-ignore
        const targetPath = path.join(cwd, projectPath || './');
        // @ts-ignore
        const pathValue = path.join(targetPath, projectName);
        const templatePath = path.resolve(__dirname, '../template');
        // 检测路径是否存在
        if (fs.existsSync(pathValue)) {
            // 存在，直接输入错误信息，并返回
            logger.errorTip('创建出错', 'exit: 目录已经存在');
            return;
        }
        // 创建文件夹
        mkdirsFolder(pathValue);
        mkdirsFolder(`${pathValue}/pages`);
        mkdirsFolder(`${pathValue}/components`);
        mkdirsFolder(`${pathValue}/utils`);
        // 复制文件 app.js sitemap.json
        copyFile(`${templatePath}/app.js`, `${pathValue}/app.js`, function(flag) {
            flag && logger.success('生成 app.js 成功');
        });
        copyFile(`${templatePath}/sitemap.json`, `${pathValue}/sitemap.json`, function(flag) {
            flag && logger.success('生成 sitemap.json 成功');
        });
        // 创建文件 app.wxss app.json project.config.json
        projectJsonFile(name, appid, pathValue);
        appJsonFile(name, pathValue);
        createFile(`${pathValue}/app.wxss`, '', function (flag) {
            flag && logger.success('生成 app.wxss 成功');
        });
        // 创建index页面
        mkdirsFolder(`${pathValue}/pages/index`);
        copyFile(`${templatePath}/page.js`, `${pathValue}/pages/index/index.js`, function(flag) {
            flag && logger.success('生成 index.js 成功');
        });
        createFile(`${pathValue}/pages/index/index.wxss`, '', function (flag) {
            flag && logger.success('生成 index.wxss 成功');
        });
        createFile(`${pathValue}/pages/index/index.wxml`, '', function (flag) {
            flag && logger.success('生成 index.wxml 成功');
        });
        copyFile(`${templatePath}/page.json`, `${pathValue}/pages/index/index.json`, function(flag) {
            flag && logger.success('生成 index.json 成功');
        });
        
        spinner.stop();
    });
};