//index.js
//获取应用实例
var app = getApp();
var base64 = require("../../images/base64");
var util = require("../../utils/util.js");
Page({
  data: {
    articlelist: [],
    articletotal:0,
    icon: base64.icon20,
    //
    tabs: ["可交易", "未上线"],
    activeIndex: 0,
    windowWidth:0,
    tabsWidth:0,
    windowHeight:0,
    scrolllock:true, //互斥锁
    scrolltop:0
  },
  //下滑分页加载
  scrolltolower: function(e){
    //锁
    if(!this.data.scrolllock){
      return false;
    }

    //获取当前是第几页
    //console.log(this.data.articletotal);
    var currenttotal = this.data.articlelist.length
    ,row = 10
    ,currentpage = currenttotal/row
    ,requestpage = currentpage+1;

    if (currenttotal % row == 0){
      console.log(requestpage);
      //请求页
      var position = parseInt(e.currentTarget.dataset.position);
      if (position == this.data.activeIndex){
          this.getInitData(requestpage,position);
      }
    }else{
      wx.showToast({
        title: '已经没数据了，别划了~',
        icon: 'none',
        duration: 1500
      })
    }   
    
  },
  //上滑刷新
  scrolltoupper: function(e){
    //锁
    if(!this.data.scrolllock) return false;

    //数据更新造成的缓存重复问题
    
    //
    var position = parseInt(e.currentTarget.dataset.position);
    if (position == this.data.activeIndex){
        this.getInitData(1,position,1);
    }
    
    wx.showToast({
        title: '数据已刷新~',
        icon: 'none',
        duration: 1500
     })
  },
  //事件处理函数
  bindViewTap: function(e) {
    var id =e.currentTarget.id;
    var contentlength = e.currentTarget.dataset.contentlength;
    console.log(e);
    console.log(contentlength);
    if (contentlength>0){
      var app = getApp();
      app.requestArticleid = id;
      console.log(id);
      wx.navigateTo({
        url: '../articleinfo/articleinfo'
      })
    }
  },
  //列表
  getInitData: function(requestpage,position,isreset=0,istabClick=0){
    //init
    var isreset = (isreset)?isreset:0;
    var requestpage = (requestpage)?requestpage:1;
    var that = this
    var listdata = (isreset == 0)?that.data.articlelist:[];

    //上锁
    that.setData({scrolllock:false});
    //
    wx.showLoading({
      title:"加载中请稍后..."
    })

    //分类请求接口
    switch(parseInt(position)){
        case 0:
          var articlegroup = 1;
        break;
        case 1:
          var articlegroup = 2;
        break;
    }
  //
  wx.getUserInfo({
    success: function (res) {
      console.log(res);
      //
      wx.request({
      url: 'https://yunyingbox.cn/api.php/Index/getarticlelist',
      data: {
        'current':requestpage,
        'row':10,
        'articlegroup':articlegroup,
        'rawData':res.rawData,
        'signature':res.signature,
        'openid': wx.getStorageSync('openid')
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
       "content-type": "application/x-www-form-urlencoded"
      }, // 设置请求的 header
      success: function(res){
        // success
        console.log(res);
        if(res.statusCode == 200){
            var responsedata = res.data.data;
            for (var i=0;i<responsedata.length;i++){
              listdata.push(
                  {
                  "id": responsedata[i]['id'],
                  "title": responsedata[i]['title'],
                  "author": responsedata[i]['author'],
                  "makeby": responsedata[i]['makeby'],
                  "articleface": responsedata[i]['articleface'],
                  "abstract": responsedata[i]['abstract'],
                  "month": responsedata[i]['month'],
                  "contentlength":responsedata[i]['contentlength']
                }
              );
              
            }
            //
            console.log(listdata);
            //切换tab 数据重赋 
            that.setData({
                articletotal:listdata.length,
                articlelist:listdata,
                activeIndex: position,
                
            })
            if(istabClick == 1){
                that.setData({
                    scrolltop: 0
                })
            }

            //拆锁
            that.setData({scrolllock:true});

        }
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
        
      }
    })

      //
    }
  })
    
    

   //
   wx.hideLoading()
  },
  //分类开关
  tabClick: function (e) {
        this.getInitData(1,e.currentTarget.id,1,1)
        console.log(e);
        //this.data.articlelist = [];    
  },
  //图片加载错误处理
  binderrorimg: function(e){
      var errorImgIndex= e.target.dataset.errorimg;
      //console.log(errorImgIndex);
      this.data.articlelist[errorImgIndex]['articleface'] = "../../images/default.png"
      this.setData({
        articlelist: this.data.articlelist
      });
  },
  //预加载
  onLoad: function () {
    //
    var that = this
    app.WxAuth().then(function (res) {
        console.log(res);
        if (res.status == 200){
          console.log('onLoad');
          that.getInitData(1,0)
          wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    windowWidth: wx.getSystemInfoSync().windowWidth,
                    windowHeight: wx.getSystemInfoSync().windowHeight
                });
            }
          });
        }
    });
    
  },
  onShareAppMessage: function(options){
      return util.ShareAppMessage()
  }
})
