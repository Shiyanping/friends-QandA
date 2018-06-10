const app = getApp().globalData;
const { request } = require('../../utils/request.js')
const { login } = require('../../utils/address.js')
const { getLogin, postUserInfo } = require('../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 玩法介绍
        isState:false,
        // 密钥
        session_key:'',
        // 检测用户信息是否支持
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        // 登录弹框
        isLogin:false,
        // 直接进入
        item:'',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 检测全局密钥
        if (app.session_key){
            this.setData({
                session_key: app.session_key
            });
            // console.log(`密钥${app.session_key}`)
        } else{
            // 重新请求密钥
            getLogin(key=>{
                this.setData({
                    session_key:key
                })
                // console.log(`密钥${key}`)
            })
        }
    },
    // 查看说明
    tapState(){
        this.setData({
            isState: true
        });
    },
    // 隐藏查看说明
    tapHideState(){
        this.setData({
            isState: false
        });
    },
    // 开始出题
    tapStart(){
        if (app.userInfo){
            wx.navigateTo({
                url: '/pages/out/out'
            })
        }else{
            this.setData({
                isLogin: true,
            })
        }
    },
    // 出题记录
    tapOutRecord(){
        if (app.userInfo) {
            wx.navigateTo({
                url: '/pages/outrecord/outrecord'
            })
        } else {
            this.setData({
                isLogin: true,
            })
        }
    },
    // 答题记录
    tapOverRecord(){
        if (app.userInfo) {
            wx.navigateTo({
                url: '/pages/answerrecord/answerrecord'
            })
        } else {
            this.setData({
                isLogin: true,
            })
        }
    },
    // 查看付费详情
    tapDetail(){
        wx.navigateTo({
            url: '/pages/index/detail/detail'
        })
    },
    // 获取用户信息
    ongetuserinfo(res){
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        // 授权完成直接进入
        const { item } = res.currentTarget.dataset;
        // 去除弹框影响
        if (item){
            console.log(item)
            this.setData({
                item: item
            })
        }else{
            this.setData({
                item: 'start'
            })
            console.log(this.data.item)
        }
        const { encryptedData, errMsg, iv, rawData, signature,userInfo } = res.detail;
        // 保存到全局
        app.userInfo = userInfo;
        // 检测用户是否授权
        if (userInfo){
            // 调用保存用户信息
            postUserInfo(userInfo,res=>{
                const item = this.data.item;
                if (item =='start'){
                    this.tapStart();
                }
                if (item == 'out') {
                    this.tapOutRecord();
                }
                if (item == 'over') {
                    this.tapOverRecord();
                }
                if (item == 'detail') {
                    this.tapDetail();
                }
            });
            this.setData({
                isLogin: false
            })
            wx.hideLoading()
        }else{
            // 未授权
            this.setData({
                isLogin:true,
            })
            wx.hideLoading()
        }
    },
    // 关闭登录弹框
    hideLogin(){
        this.setData({
            isLogin: false
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})