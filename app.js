//app.js
App({
    globalData: {
        third_session: '',
        api_url: 'https://shop.iccssi.com',
        //api_url: 'http://192.168.30.40:9876',
        wxurl: 'https://shop.iccssi.com',
        code: wx.getStorageSync('code') ? wx.getStorageSync('code') : '',
        children_num: wx.getStorageSync('children_num') ? wx.getStorageSync('children_num') : 0,
        dxbfile: '',
        orderGood: null
    },
    onLaunch: function () {
        
    },

    //wxlogin 成功后保存third_session，后续传到后台获取openid
    wxlogin: function (callback) {
        var that = this;
        wx.login({
            success: function (res) {
                var url = that.globalData.api_url + '/app/login/' + res.code;
                var data = { code: res.code };
                var action = { header: 'application/x-www-form-urlencoded', method: 'post', url: url };
                that.ajax(action, data, function (rtn) {
                    if (rtn.code == 0) {
                        var obj = {
                            value: rtn.data,
                            expire_time: (new Date()).getTime() + 2 * 3500 * 1000  //有效期2小时
                        };

                        wx.setStorageSync('third_session', obj);//存储3d_session
                        that.globalData.third_session = obj;
                        callback();
                    }
                    else {
                        that.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                    }
                });
            }
        });
    },

    paramToQuery: function (data) {
        var param = '';
        if (data && typeof data == "object") {
            for (var key in data) {
                if (param == '') {
                    param = key + '=' + data[key];
                }
                else {
                    param = param + '&' + key + '=' + data[key];
                }
            }
            param = '?' + param;
        }
        return param;
    },

    getimg(category, img){
        let third_session = this.globalData.third_session && this.globalData.third_session.value ? this.globalData.third_session.value : '';
        if (category == 'main') {
            return this.globalData.api_url + '/app/goods/image/' + img + '?imageType=GOODS_IMAGE&third_session=' + third_session;
        }
        else {
            return this.globalData.api_url + '/app/goods/image/' + img + '?imageType=GOODS_DETAIL&third_session=' + third_session;
        }
    },

    dxb(img) {
        let third_session = this.globalData.third_session && this.globalData.third_session.value ? this.globalData.third_session.value : '';
        return this.globalData.api_url + '/app/order/directorImage/' + img + '?third_session=' + third_session;
    },

    ajax: function (action, data, callback) {
        var that = this;
        if (action.url.indexOf('?') !== -1) {
            if (action.url.indexOf('&') !== -1) {
                action.url = action.url + '&third_session=' + that.globalData.third_session.value;
            }
            else {
                action.url = action.url + 'third_session=' + that.globalData.third_session.value;
            }
        }
        else {
            action.url = action.url + '?third_session=' + that.globalData.third_session.value;
        }

        wx.request({
            method: action.method,
            url: action.url,
            header: {
                'Content-Type': action.header
            },
            data: data,
            success: function (res) {
                if (res.hasOwnProperty('data') && (res.data.hasOwnProperty('code') && res.data.code != 99999)) {
                    if (typeof (callback) == 'function') {
                        callback(res.data);
                    }
                }
                else {
                    wx.removeStorageSync('third_session');
                    if (res.hasOwnProperty('data') && (res.data.hasOwnProperty('message'))) {
                        that.showToast(res.data.message, '/static/images/cry_white.png', 'img');
                    }
                }
            },
            fail(res){
                that.showToast('请求失败', '/static/images/cry_white.png', 'img');
            }
        });
    },

    api(action, data, callback){
        let that = this;
        that.checkLogin(()=>{
            that.ajax(action, data, callback);
        });
    },

    checkLogin: function (callback) {
        var that = this;
        var third_session = wx.getStorageSync('third_session');
        if (!third_session) {
            //没有登录信息，去执行登录流程
            that.wxlogin(callback);
        }
        else {
            var expire_time = third_session.expire_time;
            var now = (new Date()).getTime();

            //判断服务器缓存是否有效
            if (third_session && now < expire_time) {
                //服务器有缓存，再检测是否session_key有效
                wx.checkSession({
                    success: function() {
                        //session_key 未过期，并且在本生命周期一直有效
                        console.log('checkSession success');
                        that.globalData.third_session = third_session;
                        callback();
                    },
                    fail: function () {
                        // session_key 已经失效，需要重新执行登录流程
                        console.log('checkSession fail');
                        that.wxlogin(callback);
                    }
                });
            }
            else{
                console.log('服务器缓存失效');
                that.wxlogin(callback);
            }
        }
    },

    showToast: function (text, icon, type = 'icon') {
        if (type == 'icon') {
            wx.showToast({
                title: text,
                icon: icon,
            });
        }
        else {
            wx.showToast({
                title: text,
                image: icon,
            });
        }
    },

    showLoading: function (text) {
        wx.showLoading({
            title: text,
            mask: true
        })
    },

    hideLoading: function () {
        wx.hideLoading();
    },
});
