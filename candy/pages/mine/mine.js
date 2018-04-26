//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {}
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this

    //调用应用实例的方法获取全局数据
    that.setData({
       userInfo: wx.getStorageSync('globalUserInfo').userInfo
    });
  }
})