//获取应用实例
var app = getApp()
Page({
    data: {
        orderId: '',
        content: '',
        loading: false,
        upimgs: []
    },
    onLoad: function (options) {
        this.setData({
            orderId: options.id
        });
    },
    contentblur(e) {
        var that = this;
        if (e.detail.value) {
            that.setData({
                content: e.detail.value
            });
        }
        else {
            that.setData({
                content: ''
            });
        }
    },
    refund(e) {
        let that = this;
        if (!that.data.content) {
            app.showToast('请输入退货说明', '/static/images/cry_white.png', 'img');
            return false;
        }

        if (!that.data.loading) {
            that.setData({
                loading: true
            });
            app.showLoading('提交中…');

            let images = '';
            for (let i = 0; i < that.data.upimgs.length; i++) {
                if (images) {
                    images = images + ',' + that.data.upimgs[i].server;
                }
                else {
                    images = that.data.upimgs[i].server;
                }
            }

            let url = app.globalData.api_url + '/app/reject/reject';
            let data = {
                reason: that.data.content,
                orderId: that.data.orderId,
                rejectImage: images,
                formid: e.detail.formId
            };

            let action = { header: 'application/json', method: 'post', url: url };
            app.api(action, data, function (rtn) {
                that.setData({
                    loading: false
                });
                app.hideLoading();
                if (rtn.code == 0) {
                    setTimeout(function () {
                        app.showToast('提交成功', 'success', 'icon');
                    }, 300);

                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/detail/detail?id=' + that.data.orderId
                        });
                    }, 1500);
                }
                else {
                    setTimeout(function () {
                        app.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                    }, 300);
                }
            });
        }
    },
    select_pic() {
        var that = this;
        let third_session = app.globalData.third_session && app.globalData.third_session.value ? app.globalData.third_session.value : '';
        app.checkLogin(() => {
            wx.chooseImage({
                count: 5, // 默认9
                sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                    var tempFilePaths = res.tempFilePaths;
                    if (tempFilePaths.length > 0) {
                        app.showLoading('上传中…');

                        let success = 0;
                        let num = 0;
                        let upimgs = [];
                        for (let i = 0; i < tempFilePaths.length; i++) {
                            wx.uploadFile({
                                url: app.globalData.api_url + '/app/reject/uploadRejectImage?third_session=' + third_session,
                                filePath: tempFilePaths[i],
                                name: 'pic',
                                formData: {},
                                success: function (res) {
                                    let rtn = JSON.parse(res.data);
                                    num++;
                                    if (rtn.code == 0) {
                                        success++;
                                        if (num == tempFilePaths.length) {
                                            app.hideLoading();
                                        }

                                        setTimeout(function () {
                                            app.showToast('成功上传' + success + '张', 'success', 'icon');
                                        }, 300);
                                        upimgs.push({
                                            original: tempFilePaths[i],
                                            server: rtn.data
                                        });
                                        that.setData({
                                            upimgs: upimgs
                                        });
                                        console.log(upimgs);
                                    }
                                    else {
                                        if (num == tempFilePaths.length) {
                                            app.hideLoading();
                                        }

                                        setTimeout(function () {
                                            app.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                                        }, 300);
                                    }
                                },
                                fail: function (res) {
                                    num++;
                                    if (num == tempFilePaths.length) {
                                        app.hideLoading();
                                    }
                                }
                            });
                        }
                    }
                }
            });
        });
    }
})