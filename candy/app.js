//app.js
import Promise from './utils/promise.js'

App({
  onLaunch: function () {
    
    //显示转发
    /*
    wx.showShareMenu({
      withShareTicket: true,
      success: function(res){
          console.log('success');
          console.log(res);
      },
      complete: function(res){
          console.log('complete');
          console.log(res);
      }
    });*/
  },
  WxAuth: function(){
      var that = this;
      return new Promise(function (resolve, reject) {
          //用户信息补录
          if (wx.getStorageSync('openid') != undefined){
            if (wx.getStorageSync('rowdatarecord') == '') {
              console.log('has no rowdatarecord');
                wx.getUserInfo({
                  success: function (res) {
                    console.log('has request');
                    wx.request({
                      url: 'https://yunyingbox.cn/api.php/Userauth/has_record',
                      data: { 'openid': wx.getStorageSync('openid'), 'rowdata': res.rawData },
                      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                      header: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      success: function (res) {
                        console.log(res);
                        if (res.data.status == 200){
                            wx.setStorageSync('rowdatarecord', res.data.status)
                            console.log('record:200');
                          }
                      }
                    })

                  }
                })
            }
          }
          
          //用户授权
          wx.getSetting({
              success(res) {
                  if (!res.authSetting['scope.record']) {
                      wx.authorize({
                          scope: 'scope.record',
                          success: () => {
                                //验session
                                wx.checkSession({
                                  success: function(){
                                    console.log('login success');
                                    if(wx.getStorageSync('openid')){
                                        console.log('已登录！');
                                        resolve({status: 200, msg:'已登录！'});
                                    }else{
                                      console.log('未登录！');
                                      that.getSessionKey(resolve, reject)
                                    }
                                  },
                                  fail: function(){
                                    that.getSessionKey(resolve, reject)
                                  }
                                })
                          },
                          fail: () =>{
                            wx.navigateTo({
                              url: '/pages/article/article'
                            })
                          }
                      })
                  }else{
                    //验session
                    wx.checkSession({
                      success: function(){
                        console.log('login success');
                        if(wx.getStorageSync('openid')){
                            console.log('已登录！');
                            resolve({status: 200, msg:'已登录！'});
                        }else{
                          console.log('未登录！');
                          that.getSessionKey(resolve, reject)
                        }
                      },
                      fail: function(){
                        that.getSessionKey(resolve, reject)
                      }
                    })
                  }
              }
          })  


          //

          wx.showShareMenu({
              withShareTicket: true
          })
      });
      
  },
  getSessionKey: function(resolve, reject){

    var that = this;
      //调用登录接口
      wx.login({
        success: function (data) {
          var wxcode = data.code;
          console.log(wxcode);

          wx.request({
            url: 'https://yunyingbox.cn/api.php/Userauth/get_session_key',
            data: {'wxcode':wxcode},
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
            "content-type": "application/x-www-form-urlencoded"
            }, // 设置请求的 header
            success: function(res){
              // success
              console.log(res);
              //session_key
              //var session_key = res.session_key;
              //wx.setStorageSync('session_key',session_key);
              var openid = res.data.openid;
              wx.setStorageSync('openid',openid);

              var firsttime = res.data.firsttime;


              //userinfo
              wx.getUserInfo({
                success: function (res) {
                  console.log(res);
                  var app = getApp();
                  app.globalUserInfo = res;
                  wx.setStorageSync('globalUserInfo',res)
                  //that.globalData.userInfo = res.userInfo
                  //mine callback
                  if (this.UserInfoCallback){
                    this.UserInfoCallback(res);
                  }
                  console.log(res.rawData);
                  if (firsttime == 0 ){
                      wx.request({
                        url: 'https://yunyingbox.cn/api.php/Userauth/update_rowdata',
                        data: {
                          'openid':openid,
                          'rowdata':res.rawData
                          },
                        method: 'POST',
                        header: {
                          "content-type": "application/x-www-form-urlencoded"
                        },
                        success: function(res){
                           console.log(res);
                        }
                      })
                  }
                  resolve({status: 200, msg: '授权成功！'});
                }
              })
              
            },
            fail: function() {
              // fail
              reject({status: 500, msg: '授权失败！'});
            },
            complete: function() {
              // complete
            }
          })

        }
      })
  }
  

})
