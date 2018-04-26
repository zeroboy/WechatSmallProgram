//index.js
//获取应用实例
var app = getApp();
var base64 = require("../../images/base64");
var util = require("../../utils/util.js");
var sliderWidth = 96;
Page({
  data: {
    articlelist: [],
    articletotal:0,
    icon: base64.icon20,
    //
    tabs: ["导航", "科普", "项目"],
    activeIndex: 1,
    sliderOffset: 0,
    sliderLeft: 0,
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
    var that = this;
    console.log(e);
    console.log(contentlength);
    if (contentlength>0){
      var app = getApp();
      app.requestArticleid = id;
      console.log(id);
      wx.navigateTo({
        url: '../articleinfo/articleinfo',
        success:function(){
          //手动更新read
          that.manualUpdateReadnum(id);
        }
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
          var articlegroup = 3;
        break;
        case 1:
          var articlegroup = 4;
        break;
        case 2:
          var articlegroup = 5;
        break;
    }
    
 
    wx.request({
      url: 'https://yunyingbox.cn/api.php/Index/getarticlelist',
      data: {
        'current':requestpage,
        'row':10,
        'articlegroup':articlegroup,
        'rawData':wx.getStorageSync('globalUserInfo').rawData,
        'signature':wx.getStorageSync('globalUserInfo').signature,
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
              var readnum = (wx.getStorageSync('readnum_'+responsedata[i]['id']))?wx.getStorageSync('readnum_'+responsedata[i]['id']):1;
              listdata.push(
              {
                  "id": responsedata[i]['id'],
                  "title": responsedata[i]['title'],
                  "author": responsedata[i]['author'],
                  "makeby": responsedata[i]['makeby'],
                  "articleface": responsedata[i]['articleface'],
                  "abstract": responsedata[i]["abstract"],
                  "read": parseInt(responsedata[i]["readnum"])+readnum,
                  "month": responsedata[i]["month"],
                  "contentlength":responsedata[i]['contentlength']
              }
              );
              
            }
            //
            console.log(listdata);
            that.setData({
                articletotal:listdata.length,
                articlelist:listdata,
                activeIndex:position
                
            })
            if (istabClick == 1){
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
   wx.hideLoading()
  },
  //read 
  manualUpdateReadnum:function(id){
    try{
      var readnum = (wx.getStorageSync('readnum_'+id))?wx.getStorageSync('readnum_'+id):1;
      //更新库存read
      if (readnum % 10 == 0){
          this.updateread(id,readnum);
      }
      //自增
      wx.setStorageSync('readnum_'+id, readnum+1);
      //无刷新更新本地read
      for(var index in this.data.articlelist){
        console.log(this.data.articlelist[index].id);
        if (this.data.articlelist[index].id == id){
            //console.log("buxing");
            //console.log(this.data.articlelist[index].read);
            this.data.articlelist[index].read +=1
        }
      }

      this.setData({
          articlelist:this.data.articlelist
      });
      
    }catch(e){
      console.log(e);
    }
  },
  //自动更新read
  autoUpdateReadnum:function(){
    var that = this;
    setInterval(function(){
       var StorageInfo = wx.getStorageInfoSync();
       for (var i in StorageInfo.keys){
         if(StorageInfo.keys[i].search('readnum') != -1){
            //console.log(StorageInfo.keys[i]);
            var readnum = wx.getStorageSync(StorageInfo.keys[i]);
            var id = StorageInfo.keys[i].split("_")[1];
            (readnum != 1) && that.updateread(id,readnum);
         }  
       }
       //console.log(StorageInfo);
    },60000);

  },
  //read更新请求
  updateread:function(id,readnum){
    wx.request({
            url: 'https://yunyingbox.cn/api.php/Index/updateread',
            data: {
              'id':id,
              'read':readnum,
              'rawData':wx.getStorageSync('globalUserInfo').rawData,
              'signature':wx.getStorageSync('globalUserInfo').signature,
              'openid': wx.getStorageSync('openid')
            },
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
            "content-type": "application/x-www-form-urlencoded"
            },// 设置请求的 header
            success: function(res){
              // success
              if (res.data.code == 200){
                  wx.setStorageSync('readnum_'+id, 1)
              }
            }
          })
  },
  //分类开关
  tabClick: function (e) {
        console.log(e);
        //重置数据
        this.getInitData(1,e.currentTarget.id,1,1)
  },
  //预加载
  onLoad: function () {
    console.log('onLoad');
    var that = this
    app.WxAuth().then(function (res) {
      if (res.status == 200){
         //数据列表
        that.getInitData(1,1)

        //屏幕尺寸
   
        wx.getSystemInfo({
                success: function(res) {
                    that.setData({
                        windowWidth: wx.getSystemInfoSync().windowWidth,
                        windowHeight: wx.getSystemInfoSync().windowHeight
                    });
                }
        });

        //缓存更新监听
        that.autoUpdateReadnum()
      }
    });
  },
  onShareAppMessage: function(options){
      return util.ShareAppMessage()
  }
  
})
