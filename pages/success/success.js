// pages/success/success.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            orderId: options.id
        });
    },

    gohome(){
        wx.reLaunch({
            url: '/pages/index/index'
        });
    },

    detail() {
        wx.redirectTo({
            url: '/pages/detail/detail?id=' + this.data.orderId
        });
    },

    preview(e) {
        let src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: [src]
        });
    }
})