const app = getApp().globalData;
const { request } = require('../../utils/request.js')
const { listRecord, weixinPay, checkOneFriend, checkAllFriend, getUserInfo } = require('../../utils/address.js')
const { getLogin, postUserInfo, globalUserInfo } = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLook: false,
        // 多套题目
        list: [],
        // 查看题目
        topicList: {},
        isPay: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        // 请求后台的用户数据，存储session
        const { nickName, gender, avatarUrl, city, country, language, province } = app.userInfo;
        request(getUserInfo, {
            sessionId: app.session_key,
            gender: gender,
            headImg: avatarUrl,
            nickname: nickName,
        }, 'POST', res => {
            // 获取成功
            this.init()
        });
    },
    init() {
        // console.log(`密钥${0}`)
        request(listRecord, {
            sessionId: app.session_key
        }, 'POST', res => {
            wx.hideLoading()
            let arr = res.data.data;
            // console.log(`出题记录数据${JSON.stringify(res)}`)
            this.setData({
                list: arr
            })
        })
    },
    // 展开全部
    openAll(event) {
        const { item, index } = event.currentTarget.dataset;
        const list = this.data.list;
        item.toggle = !item.toggle;
        list[index] = item;
        // 更新
        this.setData({
            list: list
        })
    },
    // 查看题目
    lookTopic(event) {
        const { id } = event.currentTarget.dataset;
        // console.log(id);
        wx.navigateTo({
            url: '/pages/outrecord/lookproblem/lookproblem?id=' + id,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    // 查看每个人的回答
    lookUserAnswer(event) {
        const { pid, id } = event.currentTarget.dataset;
        const list = this.data.list;
        // 外层数据
        const right = list.filter(item => {
            return item.recordId == pid;
        })[0]
        // 内层数据
        const mright = right.answerBys.filter(item => {
            return item.recordId == id;
        })[0]
        // 用户信息
        const { gender, headImg, nickname, userId } = mright.user;
        const arr = mright.answerContent.map(item => {
            const { question, answer, correct } = item;
            const right = answer.filter(item => {
                return item.is_right == 1;
            })[0].value;
            return {
                problem: question,
                answer: right,
                right: correct,
            }
        });
        const obj = {
            topicList: {
                allRecordId: right.recordId,
                recordId: mright.recordId,
                userId: userId,
                name: `${nickname} 的回答`,
                head: !!headImg ? headImg : '/images/empty.png',
                isName: !!headImg,
                arr: arr
            }
        }
        this.setData(obj)
        // 启动弹框
        this.setData({
            isLook: true
        })
    },
    // 关闭题目
    hideToggle() {
        this.setData({
            isLook: false
        })
    },
    // 查看他是谁
    requestWho() {
        // 用户信息
        const user = this.data.topicList;
        this.setData({
            isPay: true,
            isLook: false,
        })
    },
    // 隐藏
    hidePay() {
        this.setData({
            isPay: false,
            isLook: true,
        })
    },
    // 支付
    payMoney(event) {
        let { pay } = event.currentTarget.dataset;
        const user = this.data.topicList;
        let id = '';
        let action = '';
        if (pay == 0.5) {
            // this.getOneFriend();
            id = user.recordId
            action = 1
        }
        if (pay == 2) {
            // this.getAllFriend();
            id = user.allRecordId
            action = 2
        }
        // payAction为支付行为：1查看单个好友 2查看所有好友 3再答一次 4偷看答案
        request(weixinPay, {
            sessionId: app.session_key,
            recordId: id,
            amount: pay * 100,
            payAction: action,
        }, 'POST', res => {
            const { appId, nonceStr, pack_age, paySign, signType, timeStamp } = res.data.data;
            wx.requestPayment({
                timeStamp: timeStamp,
                nonceStr: nonceStr,
                package: pack_age,
                signType: signType,
                paySign: paySign,
                success: res => {
                    const { errMsg } = res;
                    if (errMsg == 'requestPayment:ok') {
                        if (pay==0.5){
                            this.getOneFriend();
                        }
                        if (pay == 2) {
                            this.getAllFriend();
                        }
                        console.log('支付成功');
                    } else {
                        console.log('不知道')
                    }
                },
                fail: res => {
                    const { errMsg } = res;
                    if (errMsg =='requestPayment:fail cancel'){
                        // 用户取消支付
                    }else{
                        // 调用支付失败
                    }
                },
            })
        })
    },
    // 查看某好友，支付回调
    getOneFriend(){
        const user = this.data.topicList;
        console.log(user)
        request(checkOneFriend, {
            sessionId: app.session_key,
            recordId: user.recordId,
        }, 'POST', res=>{
            // 刷新数据
            this.init()
            // 关闭所有弹框
            this.setData({
                isPay: false,
                isLook: false,
            })
            console.log(res)
        }) 
    },
    // 查看所有好友，支付回调
    getAllFriend(){
        const user = this.data.topicList;
        console.log(user)
        request(checkAllFriend, {
            sessionId: app.session_key,
            recordId: user.allRecordId,
        }, 'POST', res => {
            // 刷新数据
            this.init()
            // 关闭所有弹框
            this.setData({
                isPay: false,
                isLook: false,
            })
            console.log(res)
        }) 
    },
    // 跳转首页
    emptyIndex(){
        wx.navigateTo({
            url: '/pages/index/index',
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
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