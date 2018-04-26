//index.js
//获取应用实例
var app = getApp()
//富文本数据解析
var WxParse = require('../wxParse/wxParse.js');
var util = require("../../utils/util.js");
Page({
  data: {
    "thisarticle":{}
  },
  onLoad: function () {
    console.log('onLoad')
    var Articleid = getApp().requestArticleid;
    var that = this;

    app.WxAuth().then(function (res) {
        if (res.status == 200){
          //
          ////
          wx.request({
            url: 'https://yunyingbox.cn/api.php/Index/getarticleinfo',
            data: {
              'id':Articleid,
              'rawData':wx.getStorageSync('globalUserInfo').rawData,
              'signature':wx.getStorageSync('globalUserInfo').signature,
              'openid': wx.getStorageSync('openid')
            },
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
            "content-type": "application/x-www-form-urlencoded"
            }, // 设置请求的 header
            success: function(res){
                  console.log(res);
                  // success
                  var articleinfo = res.data.data;
                  console.log(articleinfo.articlegroup);
                  WxParse.wxParse('article', 'html', articleinfo.article_content, that, 5);
                  that.setData({
                      thisarticle:articleinfo
                  })
            },
            fail: function() {
              // fail
            },
            complete: function() {
              // complete
            }
          })

          ////
        }
    });

  },
  onShareAppMessage: function(options){
      return util.ShareAppMessage()
  }
})
