//获取应用实例
var app = getApp()
Page({
    data: {
        orderId: '',
        attitudeScore: 0,
        productScore: 0,
        promptScore: 0,
        content: '',
        loading: false,
        upimgs: [],
        stars: [0, 1, 2, 3, 4],
        normalSrc: '../../static/images/normal.png',
        selectedSrc: '../../static/images/selected.png',
        halfSrc: '../../static/images/half.png',
        keys: [0, 0, 0]//评分
    },
    onLoad: function (options) {
        this.setData({
            orderId: options.id
        });
    },
    //点击右边,半颗星
    selectLeft: function (e) {
        var key = e.currentTarget.dataset.key;
        var idx = e.currentTarget.dataset.idx;
        var keys = this.data.keys;
        if (this.data.keys[idx] == 0.5 && e.currentTarget.dataset.key == 0.5) {
            //只有半颗星的时候,再次点击,变为0颗
            key = 0;
        }
        keys[idx] = key;
        if(idx == 0){
            this.setData({
                keys: keys,
                productScore: key
            });
        }
        else if (idx == 1) {
            this.setData({
                keys: keys,
                promptScore: key
            });
        }
        else if (idx == 2) {
            this.setData({
                keys: keys,
                attitudeScore: key
            });
        }
    },
    //点击左边,整颗星
    selectRight: function (e) {
        var key = e.currentTarget.dataset.key;
        var idx = e.currentTarget.dataset.idx;
        var keys = this.data.keys;

        keys[idx] = key;
        if (idx == 0) {
            this.setData({
                keys: keys,
                productScore: key
            });
        }
        else if (idx == 1) {
            this.setData({
                keys: keys,
                promptScore: key
            });
        }
        else if (idx == 2) {
            this.setData({
                keys: keys,
                attitudeScore: key
            });
        }
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
    comment(){
        let that = this;
        if (!that.data.loading){
            that.setData({
                loading: true
            });
            app.showLoading('提交中…');

            let images = '';
            for (let i = 0; i < that.data.upimgs.length; i++){
                if (images){
                    images = images + ',' + that.data.upimgs[i].server;
                }
                else{
                    images = that.data.upimgs[i].server;
                }
            }

            let url = app.globalData.api_url + '/app/comment';
            let data = {
                attitudeScore: that.data.attitudeScore,
                productScore: that.data.productScore,
                promptScore: that.data.promptScore,
                content: that.data.content,
                orderId: that.data.orderId,
                images: images
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

                    setTimeout(()=>{
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
                        for (let i = 0; i < tempFilePaths.length; i++){
                            wx.uploadFile({
                                url: app.globalData.api_url + '/app/comment/uploadCommentImage?third_session=' + third_session,
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
                                    if (num == tempFilePaths.length){
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