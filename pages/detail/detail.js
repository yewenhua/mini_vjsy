// pages/detail/detail.js
const app = getApp();
var util = require("../../utils/util.js");
var hasload = false;
Page({

    /**
     * 页面的初始数据
     */   
    data: {
        id: '',
        detail: '',
        stars: [0, 1, 2, 3, 4],
        normalSrc: '../../static/images/normal.png',
        selectedSrc: '../../static/images/selected.png',
        halfSrc: '../../static/images/half.png',
        showRefund: false,
        animationData: {},
        showModalStatus: false,
        content: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        hasload = false;
        this.setData({
            id: options.id
        });

        this.detail(() => {
            setTimeout(() => {
                hasload = true;
            }, 300);
        });
    },

    onShow: function () {
        if (hasload) {
            this.detail(() => {});
        }
    },

    comment() {
        wx.navigateTo({
            url: '../star/star?id=' + this.data.id
        });
    },

    detail(cb) {
        var that = this;
        var url = app.globalData.api_url + '/app/order/detail/' + that.data.id;
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
                    rtn.data.img = app.getimg('main', rtn.data.goodsImage);
                    rtn.data.dxb = rtn.data.directorImage ? app.dxb(rtn.data.directorImage) : '';
                    rtn.data.yy_time = rtn.data.appointmentDate ? rtn.data.appointmentDate.substring(0, 16) : '';
                    rtn.data.fix_time = rtn.data.fixDate ? rtn.data.fixDate.substring(0, 16) : '';

                    let imgs = rtn.data.commentImages;
                    let arr = [];
                    if (imgs && imgs.indexOf(',') !== -1){
                        let tmp = imgs.split(',');
                        for (let i = 0; i < tmp.length; i++){
                            let img = that.commentImg(tmp[i]);
                            arr.push(img);
                        }
                    }
                    else if (imgs){
                        let img = that.commentImg(rtn.data.commentImages);
                        arr.push(img);
                    }
                    rtn.data.imgs = arr; 


                    let reject_imgs = rtn.data.rejectImage;
                    let reject_arr = [];
                    if (reject_imgs && reject_imgs.indexOf(',') !== -1) {
                        let tmp = reject_imgs.split(',');
                        for (let i = 0; i < tmp.length; i++) {
                            let img = that.rejectImg(tmp[i]);
                            reject_arr.push(img);
                        }
                    }
                    else if (reject_imgs) {
                        let img = that.rejectImg(rtn.data.rejectImage);
                        reject_arr.push(img);
                    }
                    rtn.data.rejectImgs = reject_arr;                     
                    that.setData({
                        detail: rtn.data,
                        loading: false
                    });

                    cb();
                }
                else {
                    that.setData({
                        loading: false
                    });
                    app.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                    cb();
                }
            });
        }
    },

    preview(e){
        var category = e.currentTarget.dataset.cate;
        if (category == 'main'){
            wx.previewImage({
                current: this.data.detail.img,
                urls: [this.data.detail.img]
            });
        }
        else if (category == 'dxb'){
            wx.previewImage({
                current: this.data.detail.dxb,
                urls: [this.data.detail.dxb]
            });
        }
        else if (category == 'refund') {
            var idx = e.currentTarget.dataset.idx;
            wx.previewImage({
                current: this.data.detail.rejectImgs[idx],
                urls: this.data.detail.rejectImgs
            });
        }
        else{
            var idx = e.currentTarget.dataset.idx;
            wx.previewImage({
                current: this.data.detail.imgs[idx],
                urls: this.data.detail.imgs
            });
        }
    },
    commentImg(img) {
        let third_session = app.globalData.third_session && app.globalData.third_session.value ? app.globalData.third_session.value : '';
        return app.globalData.api_url + '/app/comment/commentImage/' + img + '?third_session=' + third_session;
    },
    rejectImg(img) {
        let third_session = app.globalData.third_session && app.globalData.third_session.value ? app.globalData.third_session.value : '';
        return app.globalData.api_url + '/app/reject/rejectImage/' + img + '?third_session=' + third_session;
    },
    call(){
        wx.makePhoneCall({
          phoneNumber: '4001131188'
        })
    },
    callagent(e) {
        var mobile = e.currentTarget.dataset.mobile;
        wx.makePhoneCall({
            phoneNumber: mobile
        })
    },
    refund(){
        wx.navigateTo({
            url: '../refund/refund?id=' + this.data.id
        })
    },

    getDate(dateStr) {
        let dateArr = dateStr.split(/[- : \/]/);
        return new Date(dateArr[0], dateArr[1] - 1, dateArr[2], dateArr[3], dateArr[4], dateArr[5]);
    },

    contentinput(e) {
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

    cancelSubmit(e){
        if (!this.data.content) {
          app.showToast('请输入取消理由', '/static/images/cry_white.png', 'img');
          return false;
        }
        
        var currentStatus = e.currentTarget.dataset.status;
        this.popup(currentStatus);

        let that = this;
        if (!that.data.loading) {
            that.setData({
                loading: true
            });
            app.showLoading('提交中…');

            let url = app.globalData.api_url + '/app/order/cancel/' + that.data.id;
            let data = {
                id: that.data.id,
                content: that.data.content
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
                        that.detail();
                    }, 300);
                }
                else {
                    setTimeout(function () {
                        app.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                    }, 300);
                }
            });
        }    
    },

    cancel() {
      this.popup('open');
    },
    switchPop: function (e) {
      var currentStatus = e.currentTarget.dataset.status;
      this.popup(currentStatus);
    },

    popup: function (currentStatus) {
      /* 动画部分 */
      // 第1步：创建动画实例 
      var animation = wx.createAnimation({
        duration: 150, //动画时长 
        timingFunction: "linear", //线性 
        delay: 0 //0则不延迟 
      });

      // 第2步：这个动画实例赋给当前的动画实例 
      this.animation = animation;

      // 第3步：执行第一组动画 
      animation.opacity(0).translateY(1000).step();

      // 第4步：导出动画对象赋给数据对象储存 
      this.setData({
        animationData: animation.export()
      });

      // 第5步：设置定时器到指定时候后，执行第二组动画 
      setTimeout(function () {
        // 执行第二组动画 
        animation.opacity(1).translateY(0).step();
        // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
        this.setData({
          animationData: animation
        });

        //关闭 
        if (currentStatus == "close") {
          this.setData(
            {
              showModalStatus: false
            }
          );
        }
      }.bind(this), 150);

      // 显示 
      if (currentStatus == "open") {
        this.setData(
          {
            showModalStatus: true
          }
        );
      }
    }
})