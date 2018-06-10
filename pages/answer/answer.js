// pages/answer/answer.js
// const arr = require('../../utils/answer.js');//模拟数据
const app = getApp().globalData;
const { request } = require('../../utils/request.js')
const { getQuestions } = require('../../utils/address.js')
const { getLogin, postUserInfo, globalUserInfo } = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 保存出题者用户信息
        user:{},
        // 保存最初答案，第二版作废
        base:[],
        // 总题目
        arr: [],
        // 保存用户回答完成的，用于提交给后台的数据
        backArr: [],
        // 保存当下显示的数据 toggle表示是否为答案，答案true，问题为false
        showArr: [
            // [{
            //     toggle: false,
            //     text: '阿斯达开1了房',
            //     head: '/images/man.png'
            // }, {
            //     toggle: true,
            //     text: '算了贷款',
            //     head: '/images/woman.png'
            // }]
        ],
        // 答案显示
        answerArr:[
            // {
            //     id: 0,
            //     text: '苏打绿反馈'
            // }
        ],
        // 密钥
        session_key:'',
        // 整套题的id
        record_id:'',
        // 登录弹框
        isLogin: false,
        // 未授权保存初始值
        options:{},
        isBottom:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 启动loading
        wx.showLoading({
            title: '正在加载中...',
        })
        if (app.userInfo){
            // 有
            // 已经授权，但是没有获取到全局参数
            // globalUserInfo(userInfo => {
            //     // 向后台发送请求
            //     postUserInfo(userInfo, res => {
            //         // 授权，执行
            //         this.init(options);
            //     });
            // })
            this.init(options);
            console.log(1)
        }else{
            // 未授权
            this.setData({
                options: options,
                isLogin: true
            })
            // 结束loading
            wx.hideLoading();
            console.log(2)
        }
        // console.log(1)
        // // 重新请求密钥
        // getLogin(key => {
        //     this.setData({
        //         session_key: key
        //     })
        //     console.log(2)
        //     wx.getSetting({
        //         success: (res) => {
        //             console.log(3)
        //             if (!res.authSetting['scope.userInfo']) {
        //                 console.log(4)
        //                 // 未授权
        //                 this.setData({
        //                     options: options,
        //                     isLogin: true
        //                 })
        //                 // 结束loading
        //                 wx.hideLoading();
        //             } else {
        //                 console.log(5)
        //                 // 用户信息获取
        //                 // 已经授权，但是没有获取到全局参数
        //                 globalUserInfo(userInfo => {
        //                     // 向后台发送请求
        //                     postUserInfo(userInfo, res => {
        //                         // 授权，执行
        //                         this.init(options);
        //                     });
        //                 })
        //             }
        //         }, fail: res => {
        //             console.log(6)
        //             // 结束loading
        //             wx.hideLoading();
        //             wx.showModal({
        //                 title: '错误提示',
        //                 content: 'res',
        //                 success: function (res) {
        //                     if (res.confirm) {
        //                         console.log('用户点击确定')
        //                     } else if (res.cancel) {
        //                         console.log('用户点击取消')
        //                     }
        //                 }
        //             })
        //         }, complete:res=>{
        //             console.log(6)
        //             // 结束loading
        //             wx.hideLoading();
        //         }
        //     })
        // })
    },
    init(options){
        console.log(3)
        // 出题者 session_key and record_id
        const {record_id } = options;
        // 保存record_id
        this.setData({
            record_id: record_id
        })
        // 检测全局密钥
        if (app.session_key) {
            console.log(4)
            this.setData({
                session_key: app.session_key
            });
            this.getQuestionBank(app.session_key, record_id);
            // 结束loading
            wx.hideLoading();
        } else {
            console.log(5)
            // 重新请求密钥
            getLogin(key => {
                this.setData({
                    session_key: key
                })
                this.getQuestionBank(session_key, record_id);
            })
            // 结束loading
            wx.hideLoading();
        }
    },
    // 请求图库并展示
    getQuestionBank(session_key, record_id){
        // 请求题库
        const data = {
            recordId: record_id,
            sessionId: app.session_key
        };
        request(getQuestions, data, 'POST', res => {
            // self为1，跳转出题记录；self为0，跳转结果
            // 检测用户同时为出题者和答题者，跳转到出题记录
            if (res.data.data.self==1){
                wx.redirectTo({
                    url: '/pages/outrecord/outrecord',
                    success: function(res) {},
                    fail: function(res) {},
                    complete: function(res) {},
                })
                return false;
            }
            if (res.data.data.self == 0) {
                wx.redirectTo({
                    url: `/pages/answerover/answerover?list=${JSON.stringify(res.data.data.record)}&record_id=${res.data.data.setRecordId}&session_key=${app.session_key}&accuracy=${res.data.data.record.accuracy}&isFinish=false&id=${res.data.data.record.recordId}`,
                    success: function (res) { },
                    fail: function (res) { },
                    complete: function (res) { },
                })
                return false;
            }
            const { answerContent: arr, user} = res.data.data;
            // 保存arr
            this.setData({
                arr: arr,
                user:user
            })
            // 初始问题
            const obj = {
                toggle: false,
                text: arr[0].question,
                head: user.headImg
            };
            this.setData({
                showArr: [[obj]],
                answerArr: arr[0].answer,
                backArr: [arr[0]]
            });
        })
    },
    // 用户选择答案操作
    userSelect(event){
        this.setData({
            isBottom:false
        })
        const dataset = event.currentTarget.dataset;
        const id = dataset.id;
        // 获取当前问题
        const backArr = this.data.backArr;
        const len = backArr.length;
        const answer = backArr[len - 1].answer;
        console.log(answer, id)
        // 获取当前指针
        let index = this.data.backArr.length;
        // 过滤出正确答案
        let right = answer.filter(item=>{
            return item.id==id;
        })[0].value;
        backArr[len - 1].answer.map(item=>{
            if (item.id == id){
                item.is_right = 1;
            }
            return item;
        })
        // 把回答完成的答案push进去
        let obj = {
            toggle: true,
            text: right,
            head: '/images/man.png'
        };
        if(index<10){
            console.log(this.data.arr[index] && this.data.arr[index].question)
            const obj2 = {
                toggle: false,
                text: this.data.arr[index] && this.data.arr[index].question,
                head: this.data.user.headImg
            };
            this.data.showArr.push([obj2]);
        }
        this.data.showArr[index - 1].push(obj);
        let setData = {
            showArr: this.data.showArr,
            answerArr:[],
            backArr: this.data.backArr
        };
        if(index<10){
            this.data.backArr.push(this.data.arr[index]);
            setData = {
                showArr: this.data.showArr,
                answerArr: this.data.arr[index] && this.data.arr[index].answer,
                backArr: this.data.backArr
            };
        }
        this.setData(setData);
        // 滚动页面
        wx.pageScrollTo({
            scrollTop: 100000,
            duration: 300
        })
        // 题目全部答完
        if(index>=10){
            const list = this.data.backArr;
            wx.redirectTo({
                url: `/pages/answerover/answerover?list=${JSON.stringify(list)}&record_id=${this.data.record_id}`,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })
        }
        setTimeout(()=>{
            this.setData({
                isBottom: true
            })
        },400)
    },
    // 关闭登录弹框
    hideLogin() {
        this.setData({
            isLogin: false
        })
    },
    // 获取用户信息
    ongetuserinfo(res) {
        const { encryptedData, errMsg, iv, rawData, signature, userInfo } = res.detail;
        // 保存到全局
        app.userInfo = userInfo;
        // 检测用户是否授权
        if (userInfo) {
            // 授权
            this.init(this.data.options);
            this.setData({
                isLogin: false
            })
        } else {
            // 未授权
            this.setData({
                isLogin: true
            })
        }
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