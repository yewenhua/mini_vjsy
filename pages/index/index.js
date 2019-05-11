//index.js
//获取应用实例
const app = getApp();

Page({
    data: {
        code: '',
        goodslist: [],
        show: false,
        pageNumber: 1,
        pageSize: 10,
        pageCount: 1,
        loading: false,
        scrollTop: 0
    },

    onShareAppMessage: function () {
        let that = this;
        let url = '/pages/index/index?code=' + app.globalData.code;
        return {
            title: '买智能锁就上艾家甄选',
            path: url,
            imageUrl: 'https://shop.iccssi.com/images/ai_01.jpg',
            success: function (res) {
                console.log(res)
            },
            fail: function (res) {
                // 分享失败
                console.log(res)
            }
        }
    },

    onLoad: function (options) {
        var that = this;
        that.lists(()=>{});
        that.setData({
            code: options.code ? options.code : ''
        });
    },

    lists(cb) {
        var that = this;
        var url = app.globalData.api_url + '/app/goods/page';
        var param = { 
            pageNumber: that.data.pageNumber,
            pageSize: that.data.pageSize 
        };
        var query_param = app.paramToQuery(param);
        url = url + query_param;

        var data = {};
        var action = { header: 'application/x-www-form-urlencoded', method: 'get', url: url };
        if (!that.data.loading) {
            if (that.data.pageNumber == 1) {
                app.showLoading('加载中…');
            }
            that.setData({
                loading: true
            });

            app.api(action, data, function (rtn) {
                if (that.data.pageNumber == 1) {
                    app.hideLoading();
                }
                
                if (rtn.code == 0) {
                    for (let i = 0; i < rtn.data.content.length; i++){
                        rtn.data.content[i].img = app.getimg('main', rtn.data.content[i].defaultImage);
                    }
                    
                    that.setData({
                        goodslist: that.data.goodslist.concat(rtn.data.content),
                        pageCount: rtn.data.pageCount,
                        loading: false
                    });
                }
                else {
                    that.setData({
                        loading: false,
                        pageNumber: that.data.pageNumber - 1
                    });
                    app.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                }
                cb();
            });
        }
    },

    lower: function () {
        if (this.data.goodslist.length < 30 && !this.data.loading && this.data.pageNumber < this.data.pageCount) {
            this.setData({
                pageNumber: this.data.pageNumber + 1
            });

            this.lists(()=>{});
        }
    },

    open() {
        this.setData({
            show: true
        });
    },

    close() {
        this.setData({
            show: false
        });
    },

    onPullDownRefresh(){
        this.setData({
            goodslist: [],
            pageNumber: 1,
            pageCount: 1,
        });

        this.lists(()=>{
            wx.stopPullDownRefresh();
        });
    },

    scroll(event){
        this.setData({
            scrollTop: event.detail.scrollTop
        });
    }
})
