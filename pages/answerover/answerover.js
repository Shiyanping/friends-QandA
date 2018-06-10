// pages/answerover/answerover.js
const app = getApp().globalData;
const { request } = require('../../utils/request.js')
const { finishAnswer, getResults, checkOneFriend, checkAllFriend, weixinPay, anotherChance, share2Group, peekAnswer, makeAnswerViewable, checkIfAnswered} = require('../../utils/address.js')
const { getLogin } = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 再答一次
        isAgain:false,
        // 偷看答案
        isLook:false,
        arr:[],
        // 用户相关信息
        user:{
            recordId:0,//得分率
        },
        // 显示答案
        cur:{},
        // 我的回答
        myObj:{},
        // 偷看答案
        lookObj:{},
        // 保存题目id
        record_id:'',
        // 保存旧key
        session_key:'',
        // 再来一次，需要使用答完题的id进行，change接口请求
        moreId:'',
        // 群
        groupId:'',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '加载中',
        })
        const { list, record_id, session_key, accuracy, isFinish,id} = options;        // 提交答题数据
        this.setData({
            record_id: record_id,
            session_key: session_key,
        })
        this.init(list, record_id, accuracy, isFinish,id)
    },
    init(list, record_id, accuracy, isFinish,id){
        // 比率 accuracy isFinish是否调用finishAnswer接口
        if (isFinish=='false'){
            const obj = {
                user: {
                    recordId: parseInt(accuracy * 100)
                }
            }
            this.setData(obj)
            this.getResultsFn(record_id);
            // 我的回答
            const { answerContent, user: { headImg, nickname, gender, userId } } = JSON.parse(list);
            const arr = answerContent.map(item => {
                const right = item.answer.filter(item => {
                    return item.is_right == 1
                })[0].value;
                const obj = {
                    problem: item.question,
                    answer: right,
                    right: item.correct,//true对，false错
                };
                return obj;
            });
            const myObj = {
                title: '我的回答',
                head: headImg,
                btn: '偷看答案',
                arr: arr
            };
            this.setData({
                myObj: myObj,
                cur: myObj,
                moreId: id
            })
            this.getResultsFn(record_id);
            return false;
        }
        this.setData({
            record_id: record_id
        })
        request(finishAnswer, {
            answers: list,
            sessionId: app.session_key,
            recordId: record_id,
            form_id:'',
            page:'',
        }, 'POST', res => {
            this.setData({
                moreId: res.data.data.recordId
            })
            const { accuracy } = res.data.data;
            const obj = {
                user: {
                    recordId: parseInt(accuracy * 100)
                }
            }
            this.setData(obj)
            // 我的回答
            const { answerContent, user: { headImg, nickname, gender, userId} } = res.data.data;
            const arr = answerContent.map(item=>{
                const right = item.answer.filter(item=>{
                    return item.is_right==1
                })[0].value;
                const obj = {
                    problem: item.question,
                    answer: right,
                    right: item.correct,//true对，false错
                };
                return obj;
            });
            const myObj = {
                title: '我的回答',
                head: headImg,
                btn: '偷看答案',
                arr: arr
            };
            this.setData({
                myObj: myObj,
                cur: myObj
            })
            this.getResultsFn(record_id);
        })
    },
    // 请求列表
    getResultsFn(record_id){
        // 请求列表
        request(getResults, {
            sessionId: app.session_key,
            recordId: record_id,
        }, 'POST', res => {
            wx.hideLoading()
            const arr = res.data.data;
            this.setData({
                arr: arr
            })
        })
    },
    // 我也发一个
    btnIndex() {
        wx:wx.redirectTo({
            url: '/pages/index/index',
        })
    },
    // 再答一次
    btnAgain() {
        // 检测是否有答题机会
        request(checkIfAnswered, {
            sessionId: app.session_key,
            recordId: this.data.record_id,
        }, 'POST',res=>{
            const idx = res.data.data;
            console.log(idx)
            if(idx>0){
                // 有次数
                this.answerJump();
            }else{
                this.setData({
                    isAgain: true
                })
            }
        })
    },
    // 偷看答案
    btnLook() {
        this.setData({
            isLook:true
        })
    },
    // 偷看答案和我的答案切换
    curBtn(){
        const btn = this.data.cur.btn;
        if (btn=='偷看答案'){
            request(peekAnswer, {
                recordId: this.data.moreId,
                sessionId: app.session_key,
            }, 'POST', res=>{
                console.log(`用来判断是否可以查看答案${JSON.stringify(res)}`)
                if (res.data.data.appId){
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
                }else{
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
                        title: '正确答案',
                        head: res.data.data.setRecord.user.headImg,
                        btn: '我的回答',
                        arr: arr
                    }
                    console.log(obj)
                    this.setData({
                        cur: obj
                    })
                }
            })
        }else{
            this.setData({
                cur: this.data.myObj
            })
        }
    },
    // 获取一个偷看答案的资格
    getMakeAnswerViewable(){
        request(makeAnswerViewable, {
            recordId: this.data.moreId,
            sessionId: app.session_key,
        }, 'POST', res=>{
            this.curBtn();
            console.log(`获得偷看资格${JSON.stringify(res)}`);
        })
    },
    // 关闭弹框，关闭谁，来源于参数
    hideToggle(event){
        const dataset = event.currentTarget.dataset;
        const obj = {};
        obj[dataset.item]=false;
        this.setData(obj);
    },
    // 请求支付
    requestPay(){
        // this.getAnotherChance();
        // return;
        // payAction为支付行为：1查看单个好友 2查看所有好友 3再答一次 4偷看答案
        request(weixinPay, {
            sessionId: app.session_key,
            recordId: this.data.record_id,
            amount: 1 * 100,
            payAction: 3,
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
                        console.log('支付成功');
                        this.getAnotherChance();
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: `支付没有返回成功${errMsg}`,
                            success: function (res) {
                                if (res.confirm) {
                                    console.log('用户点击确定')
                                } else if (res.cancel) {
                                    console.log('用户点击取消')
                                }
                            }
                        })
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
        })
    },
    // 获得再答一次的机会
    getAnotherChance(){
        // 成功之后跳转答题页面
        // wx.navigateTo({
        //     url: `/pages/answer/answer?session_key=${this.data.session_key}&record_id=${this.data.record_id}`,
        //     success: function (res) { },
        //     fail: function (res) { },
        //     complete: function (res) { },
        // })
        // return;
        request(anotherChance, {
            recordId: this.data.moreId,
            sessionId: app.session_key
        }, 'POST', res=>{
            // console.log(this.data.session_key, this.data.record_id);
            // 成功之后跳转答题页面
            this.answerJump();
        })
    },
    // 进行答题跳转
    answerJump(){
        wx.navigateTo({
            url: `/pages/answer/answer?session_key=${this.data.session_key}&record_id=${this.data.record_id}`,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    // 偷看答案和我的答案
    answerToggle(){
        console.log(JSON.stringify(this.data.arr));
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
    // 破解加密信息
    decodeEncryptedData(errMsg, iv, encryptedData){
        // 暂时先不区分群id，等后期解密完成在区分
        // this.getAnotherChance();
        // return true;
        request(share2Group, {
            recordId: this.data.moreId,
            sessionId: app.session_key,
            encryptedData: encryptedData,
            iv: iv
        }, 'POST', res=>{
            this.setData({
                groupId: res.data.data
            })
            if (res.data.data){
                // 可以
                this.answerJump();
            }else{
                // 不可以
                wx.showModal({
                    title: '提示',
                    content: '不能分享同一个群！',
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击确定')
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
            }
            console.log(res.data.data)
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage(res){
        // 打开获取更多信息
        wx.showShareMenu({
            withShareTicket: true,
        })
        return {
            title: '快来测测谁是你的真朋友！',
            path: '/pages/index/index',
            success: res => {
                // 识别是否转发群
                if (res.shareTickets) {
                    // 获取群信息
                    const shareTicket = res.shareTickets[0];
                    wx.getShareInfo({
                        shareTicket: shareTicket,
                        success: res=> {
                            const { errMsg, iv, encryptedData } = res;
                            // console.log(`errMsg=>${errMsg}**iv=>${iv}**encryptedData=>${encryptedData}`)
                            this.decodeEncryptedData(errMsg, iv, encryptedData);
                            // 后台需要appId、sessionKey、encryptedData、iv来进行解密
                            // console.log('加密信息')
                        },
                        fail: res=> {
                            console.log(res)
                         },
                        complete: function (res) {
                            console.log(res)
                         },
                    })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '分享到个人对话非微信群！',
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                }
            },
            fail: error => {
                console.log(error)
            }
        }
    }
})