//index.js
//获取应用实例
const app = getApp();

Page({
    data: {
        mainpic: [],
        detailpic: [],
        indicatorDots: true,
        autoplay: true,
        circular: true,
        interval: 3000,
        duration: 500,
        loading: false,
        goodsid: '',
        goodsname: '',
        goodsprice: '',
        goodstype: '',
        goodssku: '',
        popup: false,
        count: 1,
        colors: []
    },
    //事件处理函数
    subOrder: function() {
        let that = this;
        let flag = false;
        for (let i = 0; i < that.data.colors.length; i++){
            if (that.data.colors[i].selected){
                flag = true;
                break;
            }
        }

        if (flag){
            that.popup();
            app.globalData.orderGood = {
                goodsid: that.data.goodsid,
                goodsname: that.data.goodsname,
                colors: that.data.colors
            };

            wx.navigateTo({
                url: '../order/index?gid=' + that.data.goodsid
            });
        }
        else{
            app.showToast('请选择商品颜色', '/static/images/cry_white.png', 'img');
        }
    },
    onLoad: function (options) {
        let that = this;
        that.setData({
            goodsid: options.gid ? options.gid : ''
        });

        if (options.gid){
            that.detail(options.gid);
        }
        else{
            app.showToast('参数错误', '/static/images/cry_white.png', 'img');
            setTimeout(()=>{
                wx.reLaunch({
                  url: '/pages/index/index'
                });
            }, 2000);
        }
    },
    detail(gid) {
        var that = this;
        var url = app.globalData.api_url + '/app/goods/detail/' + gid;
        var data = {};
        var action = { header: 'application/x-www-form-urlencoded', method: 'get', url: url };
        if (!that.data.loading) {
            app.showLoading('加载中…');
            that.setData({
                loading: true
            });

            app.api(action, data, function (rtn) {
                app.hideLoading();
                if (rtn.code == 0) {
                    let images_arr = [];
                    let mainpic = [];
                    if (rtn.data.images && rtn.data.images.indexOf(',')) {
                        images_arr = rtn.data.images.split(',');
                    }
                    if (images_arr.length > 0) {
                        for (let i = 0; i < images_arr.length; i++) {
                            mainpic.push({
                                name: images_arr[i],
                                url: app.getimg('main', images_arr[i])
                            });
                        }
                    }

                    let detailImages_arr = [];
                    let detailpic = [];
                    if (rtn.data.detailImages && rtn.data.detailImages.indexOf(',')) {
                        detailImages_arr = rtn.data.detailImages.split(',');
                    }
                    if (detailImages_arr.length > 0) {
                        for (let i = 0; i < detailImages_arr.length; i++) {
                            detailpic.push({
                                name: detailImages_arr[i],
                                url: app.getimg('detail', detailImages_arr[i])
                            });
                        }
                    }

                    let sku_arr = [];
                    let colors = [];
                    if (rtn.data.specs && rtn.data.specs.indexOf(',')) {
                        sku_arr = rtn.data.specs.split(',');
                    }
                    if (sku_arr.length > 0) {
                        for (let i = 0; i < sku_arr.length; i++) {
                            let selected = false;
                            if( i == 0 ){
                                selected = true;
                            }

                            colors.push({
                                name: sku_arr[i],
                                selected: selected
                            });
                        }
                    }

                    if (sku_arr.length == 1){
                        colors[0].selected = true;
                    }

                    that.setData({
                        mainpic: mainpic,
                        detailpic: detailpic,
                        colors: colors,
                        goodsname: rtn.data.name,
                        goodsprice: rtn.data.price,
                        goodstype: rtn.data.code,
                        goodssku: rtn.data.specs,
                        loading: false
                    });

                    wx.setNavigationBarTitle({
                        title: rtn.data.name
                    });
                }
                else {
                    app.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                }
            });
        }
    },
    onShareAppMessage: function () {
        let that = this;
        let url = '/pages/goods/item/index?gid=' + that.data.goodsid;
        return {
            title: '买智能锁就上艾家甄选',
            path: url,
            imageUrl: 'https://shop.iccssi.com/images/ai_01.jpg',
            success: function (res) {
                //console.log(res)
            },
            fail: function (res) {
                // 分享失败
                //console.log(res)
            }
        }
    },
    gonext(){
        if (this.data.colors.length == 1){
            app.globalData.orderGood = {
                goodsid: this.data.goodsid,
                goodsname: this.data.goodsname,
                colors: this.data.colors
            };

            wx.navigateTo({
                url: '../order/index?gid=' + this.data.goodsid
            });
        }
        else{
            this.popup();
        }
    },
    popup: function (e) {
        if (this.data.popup) {
            this.setData({
               popup: false
            });
        } else {
            this.setData({
               popup: true
            })
        }
    },
    select(){
        if (this.data.colors.length > 1){
            this.popup();
        }
    },
    changeNum: function (e) {
        if (e.target.dataset.alphaBeta == 0) {
            if (this.data.count > 1) {
            this.setData({
                count: this.data.count - 1
            });
            };
        } else {
            this.setData({
            count: this.data.count + 1
            });
        };
    },
    chgcolor(e){
        var index = e.target.dataset.index;
        var colors = this.data.colors;
        for (var i = 0; i < colors.length; i++){
            if(i == index){
            if(colors[i].selected){
                colors[i].selected = false;
            }
            else{
                colors[i].selected = true;
            }
            }
            else{
            colors[i].selected = false;
            }
        }
        this.setData({
            colors: colors
        });
    }
})
