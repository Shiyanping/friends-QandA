// 请求封装
const config = require('../config.js');
// 环境控制，测试为0/false，线上为1/true
const root = 1 ? config.line : config.test;

/**
 * url请求后续地址li9u
 * data请求参数
 * method请求方法，GET and POST...
 * callback回调函数
 */
function request(url, data, method, callback) {
    wx.request({
        url: root + url,
        data: data,
        header: {
            // 'content-type': 'application/json;charset=utf-8'
            'content-type':'application/x-www-form-urlencoded'
        },
        method: method,
        dataType: 'json',
        success: res => {
            let { errMsg, statusCode, data: { code, msg } } = res;
            // 检测http状态码
            if (statusCode >= 200 && statusCode < 300 || statusCode==304){
                // 检测后台返回码
                if (code == 0) {
                    callback && callback(res);
                } else {
                    // code fail
                    wx.showToast({
                        title: `code => ${errMsg}:${msg}`,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }else{
                // status fail
                wx.showToast({
                    title: `status => ${errMsg}`,
                    icon: 'none',
                    duration: 2000
                })
            }
        },
        fail: res => {
            wx.showModal({
                title: '错误提示',
                // content: `网络错误，点击刷新`,
                content: `错误：${JSON.stringify(res)}`,
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
            console.log(`request error=>${JSON.stringify(res)}，url=>${url}`);
        },
        complete: function (res) { },
    })
}

module.exports.request = request;