// pages/manual/manual.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
     file: '',
     defaultfile: '/static/images/upload.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  sub_dxb(){
    wx.navigateBack({
      delta: 1
    });
  },

  select_pic() {
    var that = this;
    let third_session = app.globalData.third_session && app.globalData.third_session.value ? app.globalData.third_session.value : '';
    app.checkLogin(()=>{
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                if (tempFilePaths.length > 0) {
                    app.showLoading('上传中…');
                    wx.uploadFile({
                        url: app.globalData.api_url + '/app/order/uploadDirectorImage?third_session=' + third_session,
                        filePath: tempFilePaths[0],
                        name: 'pic',
                        formData: {},
                        success: function (res) {
                            app.hideLoading();
                            let rtn = JSON.parse(res.data);
                            if (rtn.code == 0){
                                setTimeout(function () {
                                    app.showToast('上传成功', 'success', 'icon');
                                }, 300);
                                app.globalData.dxbfile = rtn.data;
                                that.setData({
                                    file: tempFilePaths[0]
                                });
                            }
                            else{
                                setTimeout(function () {
                                    app.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                                }, 300);
                            }
                        },
                        fail: function (res) {
                            app.hideLoading();
                        }
                    });
                }
            }
        });
    });
  }
})