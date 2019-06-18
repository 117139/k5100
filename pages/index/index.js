//index.js
//获取应用实例
const app = getApp()
var pageState = require('../../utils/pageState/index.js')
Page({
  data: {
		tokenstr: wx.getStorageSync('tokenstr'),
		bannerimg:[],
		pageindex:1,
		pagesize:10,
		keyword:'',
		more:true,
    imgUrls: [],
		sp:[],
		spimg:[],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000
  },
  onLoad: function () {
		// var that=this
  //   app.checktoken(-2)
  //   setTimeout(function(){
  //   	
  //   	that.getshoplist()
  //   },10)
  },
	
	onShow(){
		var that=this
		app.dologin()
		setTimeout(function(){
			
			that.getshoplist()
		},10)
	},
	formSubmit: function(e) {
		let that =this
		console.log('form发生了submit事件，携带数据为：', e.detail.value)
		that.setData({
			keyword:e.detail.value.sr
		})
		that.getshoplist(1)
	},
	opengoods(e){
		 let id = e.currentTarget.dataset.id
		 let sku_info_id = e.currentTarget.dataset.sku_info_id
		app.opengoods(id,sku_info_id)
	},
	//获取首页list（搜索）
	getshoplist(type){
		// console.log(pageState)
		const pageState1 = pageState.default(this)
    pageState1.loading()    // 切换为loading状态
		let that = this
		// console.log({
		// 	key:app.jkkey,
		// 	tokenstr:that.data.tokenstr,
		// 	pageindex:that.data.pageindex,
		// 	pagesize:that.data.pagesize,
		// 	goods_category_id: 0,            //(分类) 
		// 	keyword:that.data.keyword      //(搜索关键字)
		// })
		if(type){
			let remove=[]
			that.setData({
				pageindex:1,
				sp:remove
			})
		}
		wx.request({
			url:  app.IPurl1+'shoplist',
			data:{
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				pageindex:that.data.pageindex,
				pagesize:that.data.pagesize,
				goods_category_id: 0,            //(分类) 
				keyword:that.data.keyword      //(搜索关键字)
			},
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				// console.log(res.data.list)
				let rlist=res.data.list
				if(res.data.error==-2){
					app.checktoken(res.data.error)
					setTimeout(function(){
						that.onRetry()
					},0)
				}
				if(res.data.error==0){
					
					if(rlist.length>0){
						that.setData({
							sp:rlist,
							pageindex:that.data.pageindex++
						})
						let bannerimg=res.data.shop_brand_img.split(",")
						console.log(bannerimg)
						that.setData({
							bannerimg:bannerimg
						})
						// let imgb=[]
						// for(let i in rlist){
						// 	// console.log(rlist[i].goods_img)	
						// 	let rlb=rlist[i].goods_sku.goods_img.split(",")
						// 	imgb.push(rlb[0])
						// }
						// that.data.spimg = that.data.spimg.concat(imgb)
						// that.setData({
						// 	spimg:that.data.spimg
						// })
					}
					if(rlist.length<10){
						console.log('没了')
						that.setData({
							more:false
						})
					}
					 pageState1.finish()    // 切换为finish状态
				}
				
				  // pageState1.error()    // 切换为error状态
			},
			fail() {
				 pageState1.error()    // 切换为error状态
			}
		})
	},
	onRetry(){
		this.getshoplist()
	}
})
