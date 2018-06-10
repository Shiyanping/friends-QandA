// pages/component/component.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init();
    },
    init(){
        // 二维码
        const imgUrl = 'https://images.coohua.com/upload/tacit/f7d3a175fce3282aa59ac8a775ab4cbc.png';
        // 头像
        const avatarUrl = 'https://wx.qlogo.cn/mmopen/vi_32/ibO9tMJhCzqAybpgjAjz3tEichtviamLUWkiaFmkankfhTBkNiabyyMX6C9LaBSdm0IVTiaquSgribk4lvEEqdHFoUbYA/132';
        const p = Promise.all([this.promiseImageInfo(imgUrl), this.promiseImageInfo(avatarUrl)]);
        p.then(posts => {
            // 生成图片
            wx.getSystemInfo({
                success: res => {
                    // 去除loading
                    wx.hideLoading();
                    const w = res.windowWidth;
                    const h = res.windowHeight;
                    this.canvasDraw(w, h, imgUrl, avatarUrl);
                }
            })
        })
    },
    // promise封装网络图片转本地
    promiseImageInfo(url) {
        const promise = new Promise(function (resolve, reject) {
            wx.getImageInfo({
                src: url,
                success: function (res) {
                    resolve(res.path)
                },
                fail: function (res) {
                    reject(res)
                },
                complete: function (res) { },
            })
        });
        return promise;
    },
    // canvas生成
    canvasDraw(w, h, url, locaHeadlUrl) {
        const ctx = wx.createCanvasContext('canvas')
        const coe = w / 375;
        ctx.setFillStyle('rgba(255,255,255,.8)')
        ctx.fillRect(0, 0, 375 * coe, 375 * coe);
        ctx.drawImage('/images/canvas_top.png', 20, 23, 300 * coe, 71 * coe)
        // 二维码
        ctx.beginPath();
        ctx.save(); // 保存当前ctx的状态-开始
        ctx.fill();
        ctx.arc(375 / 2 * coe, 120 * coe + 150* coe / 2, 75 * coe, 0, 2 * Math.PI); //画出圆
        ctx.clip();
        ctx.drawImage(url, 112.5 * coe, 120 * coe, 150 * coe, 150 * coe);
        ctx.restore(); // 还原状态-结束
        ctx.closePath();
        // 头像
        ctx.beginPath();
        ctx.save(); // 保存当前ctx的状态-开始
        ctx.arc(375 / 2 * coe, 161.5 * coe + 67 * coe / 2, 67 / 2 * coe, 0, 2 * Math.PI); //画出圆
        ctx.fill();
        ctx.clip(); //裁剪上面的圆形
        ctx.drawImage(locaHeadlUrl, 154 * coe, 161.5 * coe, 67 * coe, 67 * coe)
        ctx.restore(); // 还原状态-结束
        ctx.closePath();
        ctx.drawImage('/images/canvas_bottom.png', 113 * coe, 291 * coe, 149 * coe, 20 * coe)
        ctx.draw();
        // 开启右上角分享
        wx.showShareMenu();
        // 提前生成图片，加延迟防止渲染空白图片
        setTimeout(item => {
            this.createCanvasImg();
        }, 500)
    },
    // canvas模式
    start: function (e) {
        // 检测是否存在url
        const dataUrl = this.data.url;
        if (dataUrl) {
            // 存在，进行图片查看
            this.previewImg();
        } else {
            this.createCanvasImg(item => {
                // 开启右上角分享
                wx.showShareMenu();
                this.previewImg(item);
            });
        }
    },
    // 生成canvas图片
    createCanvasImg(callback) {
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 750,
            height: 750,
            destWidth: 750,
            destHeight: 750,
            canvasId: 'canvas',
            success: res => {
                const url = res.tempFilePath;
                this.setData({
                    url: url
                })
                callback && callback(url);
            }
        })
    },
    // 查看图片
    previewImg() {
        const dataUrl = this.data.url;
        wx.previewImage({
            current: dataUrl, // 当前显示图片的http链接
            urls: [dataUrl] // 需要预览的图片http链接列表
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