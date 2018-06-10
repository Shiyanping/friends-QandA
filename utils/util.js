const app = getApp().globalData;
const { request } = require('./request.js')
const { login, getUserInfo } = require('./address.js')

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

// 重新请 session_key 并赋值为全局
const getLogin = callback=>{
    wx.login({
        success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            const code = res.code;
            // 请求参数
            const url = login;
            const data = {
                code: code
            };
            const method = 'POST';
            // 获取 openid and session_key
            request(url, data, method, res => {
                const session_key = res.data.data;
                // 保存全局
                app.session_key = session_key;
                callback && callback(session_key);
            });
        },
        fail:res=>{
            console.log(`login错误：${res}`)
        }
    })
}

// 向后台发送用户信息-这个是发送，还有一个获取，发送成功就OK
const postUserInfo = (userInfo,callback)=>{
    const { nickName, gender, avatarUrl, city, country, language, province } = userInfo;
    // 重新获取session_key，在获取用户信息
    getLogin(session_key=>{
        const session_id = session_key;
        app.session_key = session_key;
        request(getUserInfo, {
            sessionId: session_id,
            gender: gender,
            headImg: avatarUrl,
            nickname: nickName,
        }, 'POST', res => {
            // 获取成功
            // console.log(`后台返回用户信息${JSON.stringify(res)}`);
            callback && callback(res);
        });
    })
}

// 请求用户的信息
const globalUserInfo = callback=>{
    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    wx.getUserInfo({
        success: res => {
            // 可以将 res 发送给后台解码出 unionId
            app.userInfo = res.userInfo
            // getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            callback && callback(res.userInfo);
        }
    })
}

module.exports = {
    formatTime: formatTime,
    getLogin: getLogin,
    postUserInfo: postUserInfo,
    globalUserInfo: globalUserInfo,
}
