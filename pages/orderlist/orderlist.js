// pages/orderlist/orderlist.js
const app = getApp();
var hasload = false;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lists: [],
        loading: false,
        pageNumber: 1,
        pageSize: 10,
        pageCount: 1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        hasload = false;
        that.lists(()=>{
            setTimeout(()=>{
                hasload = true;
            }, 300);
        });
    },

    onShow: function () {
        if (hasload) {
            this.setData({
                lists: [],
                pageNumber: 1,
                pageCount: 1
            });

            this.lists(function () {
                
            }.bind(this));
        }
    },

    lists(cb) {
        var that = this;
        var url = app.globalData.api_url + '/app/order/page';
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
                if (that.data.pageNumber == 1){
                    app.hideLoading();
                }
                
                if (rtn.code == 0) {
                    for (let i = 0; i < rtn.data.content.length; i++) {
                        rtn.data.content[i].time = rtn.data.content[i].appointmentDate.substring(0, 16);
                        rtn.data.content[i].img = app.getimg('main', rtn.data.content[i].goodsImage);
                    }

                    that.setData({
                        lists: that.data.lists.concat(rtn.data.content),
                        pageCount: rtn.data.pageCount,
                        loading: false
                    });
                    cb();
                }
                else {
                    that.setData({
                        loading: false,
                        pageNumber: that.data.pageNumber - 1
                    });
                    app.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                    cb();
                }
            });
        }
    },

    lower: function () {
        if (!this.data.loading && this.data.pageNumber < this.data.pageCount) {
            this.setData({
                pageNumber: this.data.pageNumber + 1
            });

            this.lists(()=>{});
        }
    },
})