module.exports = {
    questions: [{
        type: 'input',
        name: 'name',
        message: '项目名称（eg:dev_miniprogram）:',
    }, {
        type: 'input',
        name: 'appid',
        message: 'AppID:',
    },  {
        type: 'input',
        name: 'projectPath',
        default: './',
        message: '初始化到那个目录？(默认目录 ./ ):',
    }],
};