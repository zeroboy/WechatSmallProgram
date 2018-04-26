## 糖果盒Token
###### 基于区块链入门信息快速科普的文章博客
###### 可以通过分享获得积分去查看高质量付费文章福利

#### 授权思路
###### c  wx.login ----> get code
###### c  wx.request(code) -----> s
###### s  https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code  -------> get session_key
###### s  update user set session_key = session_key where openid = openid  return session_key
###### c  storage -->session_key
###### c  wx.request() ----> wx.checkSession

