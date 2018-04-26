function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//分享监听
function ShareAppMessage(){
      var shareObj = {
　　　　title: "免费领取空投糖果哦",    
　　　　path: "pages/article/article",  
　　　　imageUrl: 'https://yunyingbox.cn/Public/Home/images/logo3.png', 
　　　　success: function(res){
　　　　　　// 转发成功之后的回调
　　　　　　if(res.errMsg == 'shareAppMessage:ok'){
              console.log(res);
              if(res.shareTickets != undefined ){
                   var shareTickets = res.shareTickets[0];
                   wx.getShareInfo({
                     shareTicket: shareTickets,
                     success: function(data){
                        console.log(data);  
                        if(data.errMsg == 'getShareInfo:ok'){
                          //
                            wx.request({
                              url: 'https://yunyingbox.cn/api.php/Index/ShareInfoSave',
                              data: {
                                "encryptedData": data.encryptedData,
                                "iv": data.iv,
                                "rawData":wx.getStorageSync('globalUserInfo').rawData,
                                "signature":wx.getStorageSync('globalUserInfo').signature,
                                "openid": wx.getStorageSync('openid')
                              },
                              method: 'POST',
                              header: {
                                  "content-type": "application/x-www-form-urlencoded"
                              },
                              success: function(ress){
                                // success
                                console.log(ress);
                              }
                            })
                        }
                     }
                   })
              }
　　　　　　}
　　　　},
　　　　fail: function(res){
　　　　　　if(res.errMsg == 'shareAppMessage:fail cancel'){
　　　　　　}else if(res.errMsg == 'shareAppMessage:fail'){
　　　　　　}
　　　　}
　　}

    return shareObj;
}

module.exports = {
  formatTime: formatTime,
  ShareAppMessage: ShareAppMessage
}


