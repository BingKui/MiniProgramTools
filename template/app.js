//app.js
App({
    onLaunch (options) {
        // 加载
    },
    onShow (options) {
        // Do something when show.
    },
    onHide () {
        // Do something when hide.
    },
    onError (msg) {
        console.log(msg);
    },
    onPageNotFound () {
        // 页面未找到
    },
    onUnhandledRejection () {
        // 监听未处理的 Promise 拒绝事件
    },
    globalData: {
        userInfo: null
    }
})