// pages/outover/outover.js
const app = getApp().globalData;
const { request } = require('../../utils/request.js')
const { getQrCode, setQuestions, ifShowQrCode } = require('../../utils/address.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // canvas图片地址
        url: '',
        isCanvas: false,
        // 成功弹框
        isSuccess: false,
        // 失败弹框控制
        toast: {
            isToast: false,
            url: '/images/share_success.png',
            text: 'share_fail.png'
        },
        // 整套题的id
        record_id: '',
        // 隐藏
        topToggle:true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getShowQrCode();
        // 判断是否再答一次，不在调用 setQuestions
        const isQuery = options.isQuery;
        const id = options.id;
        // 隐藏右上角分享
        wx.hideShareMenu();
        // 用户答案
        const list = JSON.parse(options.list);
        // 获取小程序码
        const url = setQuestions;
        const data = {
            questionList: JSON.stringify(list),
            sessionId: app.session_key
        };
        const method = 'POST';
        // 启动loading
        wx.showLoading({
            title: '加载图片...',
            mask: true
        });
        if (isQuery == 'false'){
            this.setData({
                record_id: id
            });
            this.getQr(id);
            return false;
        }
        request(url, data, method, res => {
            // 出题记录id
            const record_id = res.data.data;
            // 保存出题记录
            this.setData({
                record_id: record_id
            });
            this.getQr(record_id);
        });
    },
    // 控制检测
    getShowQrCode(){
        request(ifShowQrCode, {
            sessionId: app.session_key,
        }, 'POST', res=>{
            // res.data.data = true;
            // topToggle true不显示，false显示
            this.setData({
                topToggle: !res.data.data
            })
        })
    },
    getQr(record_id){
        // 二维码请求
        request(getQrCode, {
            sessionId: app.session_key,
            recordId: record_id,
            Path: `/pages/answer/answer?session_key=${app.session_key}&record_id=${this.data.record_id}`,
        }, 'POST', res => {
            const imgUrl = res.data.data;
            // 串联转并联
            const p = Promise.all([this.promiseImageInfo(imgUrl), this.promiseImageInfo(app.userInfo.avatarUrl)]);
            p.then(posts => {
                const [localUrl, locaHeadlUrl] = posts;
                // 生成图片
                wx.getSystemInfo({
                    success: res => {
                        // 去除loading
                        wx.hideLoading();
                        const w = res.windowWidth;
                        const h = res.windowHeight;
                        this.canvasDraw(w, h, localUrl, locaHeadlUrl);
                    }
                })
            }).catch(error=>{
                // 去除loading
                wx.hideLoading();
                wx.showModal({
                    title: '图片生成异常',
                    content: '可以直接进行分享！',
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击确定')
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
            })
        });
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
        ctx.setFillStyle('#fff')
        ctx.fillRect(0, 0, 375 * coe, 375 * coe);
        ctx.drawImage('/images/canvas_top.png', 20, 23, 300 * coe, 71 * coe)
        // 二维码
        ctx.drawImage(url, 112.5 * coe, 120 * coe, 150 * coe, 150 * coe);
        // 头像
        ctx.save(); // 保存当前ctx的状态-开始
        ctx.arc(375 / 2 * coe, 161.5 * coe + 67 * coe / 2, 67 / 2 * coe, 0, 2 * Math.PI); //画出圆
        ctx.fill();
        ctx.clip(); //裁剪上面的圆形
        ctx.drawImage(locaHeadlUrl, 154 * coe, 161.5 * coe, 67 * coe, 67 * coe)
        ctx.restore(); // 还原状态-结束
        ctx.drawImage('/images/canvas_bottom.png', 113 * coe, 291 * coe, 149 * coe, 20 * coe)
        ctx.draw();
        // 开启右上角分享
        wx.showShareMenu();
        // 提前生成图片，加延迟防止渲染空白图片
        setTimeout(item => {
            this.createCanvasImg();
        }, 500)
    },
    // 查看图片
    previewImg() {
        const dataUrl = this.data.url;
        wx.previewImage({
            current: dataUrl, // 当前显示图片的http链接
            urls: [dataUrl] // 需要预览的图片http链接列表
        })
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
    // 保存图片到相册
    saveImg() {
        // 检测是否存在url
        const dataUrl = this.data.url;
        if (!dataUrl) {
            this.createCanvasImg(item => {
                this.saveImgOver(item);
            });
        } else {
            this.saveImgOver(dataUrl);
        }
    },
    // 保存图片事件
    saveImgOver(dataUrl) {
        wx.saveImageToPhotosAlbum({
            filePath: dataUrl,
            success: res => {
                this.setData({
                    isSuccess: true,
                    isCanvas: true
                });
                // this.customToast(true, '保存成功');
                console.log(`保存成功${JSON.stringify(res)}`);
            },
            fail: error => {
                this.customToast(false, '保存图片失败，请重试');
                console.log(`保存失败：${JSON.stringify(error)}`);
                // 启动授权页面
                wx.openSetting();
            }
        })
    },
    // 隐藏成功弹框
    hideSuccess() {
        this.setData({
            isSuccess: false,
            isCanvas: false
        });
    },
    // 自定义toast
    customToast(toggle, text) {
        // 转发失败
        this.setData({
            toast: {
                isToast: true,
                url: toggle ? '/images/share_success.png' : '/images/share_fail.png',
                text: text
            }
        });
        setTimeout(() => {
            this.setData({
                toast: {
                    isToast: false
                }
            })
        }, 2000);
    },
    // 查看答题情况
    lookAnswer() {
        wx.navigateTo({
            url: '/pages/outrecord/outrecord',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
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
        const path = `/pages/answer/answer?session_key=${app.session_key}&record_id=${this.data.record_id}`
        // 检测是否存在url
        const dataUrl = this.data.url;
        const obj = {
            title: '检验我们感情的时候到了',
            path: path,
            imageUrl: dataUrl ? dataUrl : '',
            success: res => {
                this.customToast(true, '分享成功');
            },
            fail: res => {
                this.customToast(false, '分享失败');
            }
        };
        if (dataUrl) {
            // 存在，进行图片查看
            return obj;
        } else {
            this.createCanvasImg(item => {
                obj.imageUrl = item;
            });
            return obj;
        }
    }
})