// const arr = require('../../utils/data.js');//模拟数据
const app = getApp().globalData;
const { request } = require('../../utils/request.js')
const { sendQuestionsBank } = require('../../utils/address.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 后台题目集合
        arr: [],
        // 显示题目
        curTopic: {},
        // 存储用户当前指针
        curIndex: 0,
        // 存储用户已经回答完成的题目
        userTopic: [],
        // 当前显示题目数
        curUserIndex: 1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init();
    },
    // 请求题目
    init() {
        // 请求参数
        const url = sendQuestionsBank;
        const data = {
            sessionId: app.session_key
        };
        const method = 'GET';
        // 获取 openid and session_key
        request(url, data, method, res => {
            const arr = res.data.data;
            this.setData({
                arr: arr,//所有题
                curTopic: arr[0],//当前题
            });
        });
    },
    // 用户回答问题
    userAnswer(event) {
        const dataset = event.currentTarget.dataset;
        const question = dataset.question;
        const answer = question.answer;
        const answerId = dataset.answer;
        // 获取当前指针
        const curIndex = this.data.curIndex;
        // 保存用户回答完成的题目并改变状态
        answer.forEach(item => {
            if (item.id == answerId) {
                item.is_right = 1;
            } else {
                item.is_right = 0;
            }
            return item;
        });
        // 这块需要把已经完成的题目删除掉，防止循环出用户已经打完的题目，注意：指针的不变
        this.data.arr.splice(curIndex, 1);
        // 保存已经完成的题目
        this.data.userTopic.push(question);
        // 判断是否结束
        if (this.data.userTopic.length < 10) {
            this.setData({
                curUserIndex: this.data.userTopic.length + 1
            });
            // 进行换题,string类型表示指针不变
            this.changeTopic('string');
        } else {
            // 完成提交数据并跳转页面
            this.userOver();
        }
        // console.log(this.data.userTopic, this.data.arr.length);
    },
    // 用户完成出题并把题目情况，带到下一层
    userOver() {
        wx.redirectTo({
            url: '/pages/outover/outover?list=' + JSON.stringify(this.data.userTopic),
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    // 换一题
    changeTopic(item) {
        // 获取题目集合
        const arr = this.data.arr;
        // 题目长度
        const len = arr.length;
        // 获取指针并循环处理
        let curIndex = (this.data.curIndex + 1) % len;
        if (typeof (item) == 'string') {
            // 不增长
            curIndex = this.data.curIndex % len;
        } else {
            // 增长
            curIndex = (this.data.curIndex + 1) % len;
        }
        // 改变当前题目
        this.setData({
            curTopic: arr[curIndex],
            curIndex: curIndex
        });
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