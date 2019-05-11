//index.js
//获取应用实例
const app = getApp();

var submit = false;
var tcity = require("../../../utils/citys.js");
var util = require("../../../utils/util.js");
var dateTimePicker = require('../../../utils/dateTimePicker.js');
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({
    data: {
        goodsid: '',
        goodsname: '',
        goodsimg: '',
        goodsthumb: '',
        startYear: 2018,
        endYear: 2050,
        dateTime: null,
        dateTimeArray: null,
        dates: util.formatTime(new Date()).substring(0, 16),
        colorArray: [],
        index: 0,
        file: '',
        areaId: '',
        provinces: [],
        province: "",
        citys: [],
        city: "",
        countys: [],
        county: '',
        value: [0, 0, 0],
        values: [0, 0, 0],
        condition: false,
        leftsecond: 60,
        loading: false,
        animationData: {},
        showModalStatus: false,
        checked: false
    },

    formsubmit: function(e){
        let that = this;
        let postdata = e.detail.value;
        if (!postdata.username){
            app.showToast('请输入您的姓名', '/static/images/cry_white.png', 'img');
            return false;
        }

        if (!postdata.mobile) {
            app.showToast('请输入联系电话', '/static/images/cry_white.png', 'img');
            return false;
        }

        let mobilereg = /^1[0-9]{10}$/;
        if (postdata.mobile.length != 11 || !mobilereg.test(postdata.mobile)) {
            app.showToast('请填写正确手机', '/static/images/cry_white.png', 'img');
            return false;
        }

        let selectColor = '';
        if (that.data.colorArray.length > 0){
            for (let i = 0; i < that.data.colorArray.length; i++){
                if (that.data.colorArray[i].selected){
                    selectColor = that.data.colorArray[i].name;
                }
            }
        }
        else{
            app.showToast('参数错误', '/static/images/cry_white.png', 'img');
            setTimeout(()=>{
                wx.navigateBack({
                    delta: 1
                });
            }, 2000);
            return false;
        }

        if (!that.data.province || !that.data.city || !that.data.county) {
            app.showToast('请选择所在地区', '/static/images/cry_white.png', 'img');
            return false;
        }

        if (!postdata.address) {
            app.showToast('请输入详细地址', '/static/images/cry_white.png', 'img');
            return false;
        }

        // if (!that.data.file){
        //     app.showToast('请上传导向板文件', '/static/images/cry_white.png', 'img');
        //     return false;
        // }

        if (!that.data.checked) {
          //app.showToast('请阅读同意协议', '/static/images/cry_white.png', 'img');
          //return false;
        }
        
        if (!that.data.loading){
            app.showLoading('提交中…');
            that.setData({
                loading: true
            });
            
            let url = app.globalData.api_url + '/app/order/create';
            let data = { 
                receiver: postdata.username, 
                mobile: postdata.mobile, 
                address: postdata.address,
                goodsId: that.data.goodsid,
                spec: selectColor,
                directorImage: that.data.file,
                appointmentDate: that.data.dates,
                areaId: that.data.areaId,
                formid: e.detail.formId
            };

            let action = { header: 'application/json', method: 'post', url: url };
            app.api(action, data, function (rtn) {
                app.hideLoading();
                if (rtn.code == 0) {
                    app.globalData.dxbfile = '';
                    that.setData({
                        file: '',
                        loading: false
                    });

                    wx.redirectTo({
                        url: '../../success/success?id=' + rtn.data
                    });
                }
                else {
                    that.setData({
                        loading: false
                    });
                    setTimeout(function () {
                        app.showToast(rtn.msg, '/static/images/cry_white.png', 'img');
                    }, 300);
                }
            });
        }
    },

    onLoad: function (options) {
        let that = this;
        let idx = 0;
        for (let i = 0; i < app.globalData.orderGood.colors.length; i++){
            if (app.globalData.orderGood.colors[i].selected){
                idx = i;
            }
        }
        
        //time init
        var newDate = new Date();
        var newDateTwo = new Date();
        var newtime = newDateTwo.getTime() + 30 * 60 * 1000;
        newDate.setTime(newtime);

        let objTime = dateTimePicker.dateTimePicker(that.data.startYear, that.data.endYear, util.formatTime(newDate));
        let lastArray = objTime.dateTimeArray.pop();
        let lastTime = objTime.dateTime.pop();

        that.setData({
            dates: util.formatTime(newDate).substring(0, 16),
            file: app.globalData.dxbfile,
            goodsid: app.globalData.orderGood.goodsid,
            goodsname: app.globalData.orderGood.goodsid,
            colorArray: app.globalData.orderGood.colors ? app.globalData.orderGood.colors : [],
            index: idx,
            dateTimeArray: objTime.dateTimeArray,
            dateTime: objTime.dateTime
        });

        //erea init
        tcity.init(that);
        that.getCityNameOFLocation((data)=>{
            var cityData = that.data.cityData;
            var province, city, county, areaId;
            var values = [0,0,0];
            const provinces = [];
            const citys = [];
            const countys = [];

            for (let i = 0; i < cityData.length; i++) {
                provinces.push(cityData[i].name);
                if (cityData[i].name == data.address_component.province){
                    province = cityData[i].name;
                    values[0] = i;
                    for (let j = 0; j < cityData[i].sub.length; j++) {
                        citys.push(cityData[i].sub[j].name);
                        if (cityData[i].sub[j].name == data.address_component.city) {
                            city = cityData[i].sub[j].name;
                            values[1] = j;
                            for (let k = 0; k < cityData[i].sub[j].sub.length; k++) {
                                countys.push(cityData[i].sub[j].sub[k].name)
                                if (cityData[i].sub[j].sub[k].name == data.address_component.district) {
                                    county = cityData[i].sub[j].sub[k].name;
                                    areaId = cityData[i].sub[j].sub[k].code;
                                    values[2] = k;
                                }
                            }
                        }
                    }
                }
            }
            
            that.setData({
                provinces: provinces,
                citys: citys,
                countys: countys,
                province: province ? province : cityData[0].name,
                city: city ? city : cityData[0].sub[0].name,
                county: county ? county : cityData[0].sub[0].sub[0].name,
                areaId: areaId ? areaId : cityData[0].sub[0].sub[0].code,
                values: values,
                value: values
            });
        }, ()=>{
            var cityData = that.data.cityData;
            const provinces = [];
            const citys = [];
            const countys = [];

            for (let i = 0; i < cityData.length; i++) {
                provinces.push(cityData[i].name);
            }

            for (let i = 0; i < cityData[0].sub.length; i++) {
                citys.push(cityData[0].sub[i].name)
            }

            for (let i = 0; i < cityData[0].sub[0].sub.length; i++) {
                countys.push(cityData[0].sub[0].sub[i].name)
            }

            that.setData({
                'provinces': provinces,
                'citys': citys,
                'countys': countys,
                'province': cityData[0].name,
                'city': cityData[0].sub[0].name,
                'county': cityData[0].sub[0].sub[0].name,
                'areaId': cityData[0].sub[0].sub[0].code
            });
        });
    },

    onShow(){
      this.setData({
        file: app.globalData.dxbfile
      });
    },

    areaChange: function (e) {
      var val = e.detail.value;
      var t = this.data.values;
      var cityData = this.data.cityData;

      if (val[0] != t[0]) {
        const citys = [];
        const countys = [];

        for (let i = 0; i < cityData[val[0]].sub.length; i++) {
          citys.push(cityData[val[0]].sub[i].name)
        }
        for (let i = 0; i < cityData[val[0]].sub[0].sub.length; i++) {
          countys.push(cityData[val[0]].sub[0].sub[i].name)
        }

        this.setData({
            province: this.data.provinces[val[0]],
            city: cityData[val[0]].sub[0].name,
            citys: citys,
            county: cityData[val[0]].sub[0].sub[0].name,
            countys: countys,
            values: [val[0], 0, 0],
            value: [val[0], 0, 0],
            areaId: cityData[val[0]].sub[0].sub[0].code
        });
        return;
      }
      if (val[1] != t[1]) {
        const countys = [];

        for (let i = 0; i < cityData[val[0]].sub[val[1]].sub.length; i++) {
          countys.push(cityData[val[0]].sub[val[1]].sub[i].name)
        }

        this.setData({
            city: this.data.citys[val[1]],
            county: cityData[val[0]].sub[val[1]].sub[0].name,
            countys: countys,
            values: [val[0], val[1], 0],
            value: [val[0], val[1], 0],
            areaId: cityData[val[0]].sub[val[1]].sub[0].code
        });
        return;
      }
      if (val[2] != t[2]) {
        this.setData({
            county: this.data.countys[val[2]],
            values: val,
            value: val,
            areaId: cityData[val[0]].sub[val[1]].sub[val[2]].code
        });
        return;
      }
    },

    open: function () {
      this.setData({
        condition: !this.data.condition
      })
    },
    
    bindDateChange: function (e) {
        let sel_time = this.data.dateTimeArray[0][this.data.dateTime[0]] + '-' + this.data.dateTimeArray[1][this.data.dateTime[1]] + '-' + this.data.dateTimeArray[2][this.data.dateTime[2]] + ' ' + this.data.dateTimeArray[3][this.data.dateTime[3]] + ':' +  this.data.dateTimeArray[4][this.data.dateTime[4]];
      this.setData({
          dateTime: e.detail.value,
          dates: sel_time
      });
    },

    changeDateTimeColumn(e){
        var arr = this.data.dateTime, dateArr = this.data.dateTimeArray;

        arr[e.detail.column] = e.detail.value;
        dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

        let sel_time = dateArr[0][arr[0]] + '-' + dateArr[1][arr[1]] + '-' + dateArr[2][arr[2]] + ' ' + dateArr[3][arr[3]] + ':' + dateArr[4][arr[4]];

        this.setData({
            dateTimeArray: dateArr,
            dateTime: arr,
            dates: sel_time
        });
    },

    bindColorChange(e){
      this.setData({
        color: e.detail.value
      });
    },
    
    select_pic() {
      wx.navigateTo({
        url: '../../manual/manual'
      });
    },

    getCityNameOFLocation: function (successCb, failCb) {
        qqmapsdk = new QQMapWX({
            key: '2XKBZ-UFYH6-JE5SC-MY3VY-AWUBT-ODFAB'
        });

        var that = this;
        wx.getLocation({
            type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
            success: function (res) {
                qqmapsdk.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: function (res) {
                        successCb(res.result);
                    },
                    fail: function (res) {
                        failCb();
                    },
                });
            },
            fail: function () {
                // fail
                failCb();
            },
        })
    },

    switchPop: function (e) {
        var currentStatus = e.currentTarget.dataset.status;
        this.popup(currentStatus);
    },

    popup: function (currentStatus) {
        /* 动画部分 */
        // 第1步：创建动画实例 
        var animation = wx.createAnimation({
            duration: 200, //动画时长 
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
        }.bind(this), 200);

        // 显示 
        if (currentStatus == "open") {
            this.setData(
                {
                    showModalStatus: true
                }
            );
        }
    },

    protocal(){
        this.popup('open');
    },

    checkboxChange(){
      this.setData({
        checked: !this.data.checked
      });
    }
})
