const app = getApp().globalData;
const { request } = require('../../utils/request.js')
const { answerListRecord, weixinPay, checkOneFriend, checkAllFriend, getUserInfo, peekAnswer, makeAnswerViewable } = require('../../utils/address.js')
const { getLogin, postUserInfo, globalUserInfo } = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        arr: [],
        // 是否显示弹框
        isLook: false,
        cur: {},
        myObj:{},
        recordId:'',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        // 干掉转发
        wx.hideShareMenu();
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
        request(answerListRecord, {
            sessionId: app.session_key,
        }, 'POST', res => {
            const arr = res.data.data;
            this.setData({
                arr: arr
            })
            wx.hideLoading()
        })
    },
    // 查看内容
    lookData(event) {
        const { item } = event.currentTarget.dataset;
        const recordId = item.recordId;
        // 我的回答
        const arr = item.answerContent.map(citem => {
            const right = citem.answer.filter(fitem => {
                return fitem.is_right == 1
            })[0].value;
            const obj = {
                "problem": citem.question,
                "answer": right,
                "right": citem.correct
            }
            return obj;
        })
        const obj = {
            "title": "我的回答",
            "head": app.userInfo.avatarUrl,
            "btn": "偷看答案",
            "arr": arr
        };
        this.setData({
            isLook: true,
            cur: obj,
            myObj:obj,
            recordId: recordId
        })
    },
    // 偷看答案和我的答案切换
    curBtn() {
        const btn = this.data.cur.btn;
        if (btn == '偷看答案') {
            request(peekAnswer, {
                recordId: this.data.recordId,
                sessionId: app.session_key,
            }, 'POST', res => {
                // console.log(`用来判断是否可以查看答案${JSON.stringify(res)}`)
                if (res.data.data.appId) {
                    const { appId, nonceStr, pack_age, paySign, signType, timeStamp } = res.data.data;
                    // this.getMakeAnswerViewable();
                    // return;
                    // 存在，无权
                    wx.requestPayment({
                        timeStamp: timeStamp,
                        nonceStr: nonceStr,
                        package: pack_age,
                        signType: signType,
                        paySign: paySign,
                        success: res => {
                            const { errMsg } = res;
                            if (errMsg == 'requestPayment:ok') {
                                console.log('支付成功');
                                this.getMakeAnswerViewable();
                            } else {
                                console.log('不知道')
                            }
                        },
                        fail: res => {
                            const { errMsg } = res;
                            if (errMsg == 'requestPayment:fail cancel') {
                                // 用户取消支付
                            } else {
                                // 调用支付失败
                            }
                        },
                    })
                } else {
                    // 不存在，有权，list
                    const arr = res.data.data.setRecord.answerContent.map(item => {
                        const answer = item.answer.filter(citem => {
                            return citem.is_right == 1
                        })[0].value
                        const obj = {
                            problem: item.question,
                            answer: answer,
                            right: true,//true对，false错
                        }
                        return obj;
                    });
                    const obj = {
                        title: `${res.data.data.setRecord.user.nickname}\n的正确答案`,
                        head: res.data.data.setRecord.user.headImg,
                        btn: '我的回答',
                        arr: arr
                    }
                    // console.log(obj)
                    this.setData({
                        cur: obj
                    })
                }
            })
        } else {
            this.setData({
                cur: this.data.myObj
            })
        }
    },
    // 获取一个偷看答案的资格
    getMakeAnswerViewable() {
        request(makeAnswerViewable, {
            recordId: this.data.recordId,
            sessionId: app.session_key,
        }, 'POST', res => {
            this.curBtn();
            // console.log(`获得偷看资格${JSON.stringify(res)}`);
        })
    },
    // 关闭弹框，关闭谁，来源于参数
    hideToggle(event) {
        const dataset = event.currentTarget.dataset;
        const obj = {};
        obj[dataset.item] = false;
        this.setData(obj);
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
        return {
            title: '超级默契',
            path: '/pages/index/index',
            success: res => {
                console.log('成功')
            },
            fail: error => {
                console.log(error)
            }
        }
    }
})