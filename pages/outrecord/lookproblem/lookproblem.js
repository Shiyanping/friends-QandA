const app = getApp().globalData;
const { request } = require('../../../utils/request.js')
const { listRecord } = require('../../../utils/address.js')
const { getLogin, postUserInfo, globalUserInfo } = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        arr:[],
        list:[],
        id:'',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const id = options.id;
        this.setData({
            id: id
        })
        request(listRecord, {
            sessionId: app.session_key
        }, 'POST', res => {
            const arr = res.data.data;
            // 处理题目
            const list = arr.filter(item=>{
                return item.recordId==id;
            })[0].questionContent
            this.setData({
                arr: arr,
                list: list,
            })
        })
    },
    // 再来一次
    mainBtn(){
        const id = this.data.id;
        console.log(`再发一次id=>${id}`)
        wx.navigateTo({
            url: '' + JSON.stringify(this.data.list),
            url: `/pages/outover/outover?list=${JSON.stringify(this.data.list)}&isQuery=false&id=${id}`,
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