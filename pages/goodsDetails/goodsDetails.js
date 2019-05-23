//goodsdetails.js
var pageState = require('../../utils/pageState/index.js')
var WxParse = require('../../vendor/wxParse/wxParse.js')
const app = getApp()

Page({
  data: {
		spimg:[],
		goodsd:'',
		indicatorDots: true,
		autoplay: true,
		interval: 3000,
		duration: 1000,
		qujan:[
			{qj:'1-3',num:1,pri:24,gs:10000,spri:24},
			{qj:'4-10',num:7,pri:48,gs:0,spri:336},
			{qj:'10-',num:5,pri:72,gs:0,spri:360}
		],
		sheetshow:false,         //规格弹框控制
		guige:['1.2L','600mL'],  //规格
		type1:0,         //规格index
		cnum:1           ,//数量
		goods_sku_id:0,  //商品id
		pricelist:0,            //阶梯价
		havenum:0               //已购数量
  },
  onLoad: function (option) {
    if(option.id){
			console.log(option.id)
			this.setData({
				goods_sku_id:option.id
			})
		}
		this.getGoodsDetails(option.id)
  },
	onReady: function () {
		var that=this;
		
	},
	onClose(){
		this.setData({
			sheetshow:false
		})
	},
	sheetshow(){
		this.setData({
			sheetshow:true
		})
	},
	onChange(e){
		let idx =e.currentTarget.dataset.selec
		console.log(e.detail)
		// this.data.goods_sele[idx].num=e.detail
			this.setData({
				cnum:e.detail
			});
	},
	selegg(e){
		console.log(e.currentTarget.dataset.gg)
		this.setData({
			type1:e.currentTarget.dataset.gg
		})
	},
	addwgc(){
		//http://water5100.800123456.top/WebService.asmx/shopcar
		console.log('addwgc')
		let that = this
		wx.request({
			url:  app.IPurl1+'shopcar',
			data:{
				op: 'addcar',
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				goods_sku_id:that.data.goods_sku_id,						//(商品id) 
				num:that.data.cnum,															//（数量） 
				goods_unit:that.data.guige[that.data.type1]			//(规格名称) 
			},
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				console.log(res.data)
				
				if(res.data.error==-2){
					app.checktoken(res.data.error)
					that.onLoad()
				}
				if(res.data.error==0){
					let resultd=res.data
					console.log(res.data)
					that.onClose()
					wx.showToast({
						title:'添加成功'
					})
				}
			}
		})
	},
	nowbuy(){
		console.log('buy')
		//http://water5100.800123456.top/WebService.asmx/order
		let that = this
	
		// let goodsxq=JSON.stringify(this.data.goodsd)
		// let goodsname=this.data.goodsd.goods_sku_name
		let goodsguige=this.data.guige[this.data.type1]
		let goodsnum=this.data.cnum
		// let goodsladder=this.data.goodsd.is_ladder_pricing
		// let goodsxq=this.data.goodsd
		// console.log(goodsxq)
		 wx.navigateTo({
		  url: '/pages/Order/Order?id=' + that.data.goods_sku_id+'&goodsguige=' + goodsguige+'&goodsnum=' + goodsnum
		})
	},
	opengwc(e) {
	  let id = e.currentTarget.dataset.id
		console.log(id)
		
	  wx.navigateTo({
	    url: '/pages/fcar/car?id=' + id
	  })
	},
	getGoodsDetails(id){
		const pageState1 = pageState.default(this)
		pageState1.loading()    // 切换为loading状态
		let that = this
		wx.request({
			url:  app.IPurl1+'shopinfo',
			data:{
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				goods_sku_id:id
			},
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				// console.log(res.data)
				
				if(res.data.error==-2){
					app.checktoken(res.data.error)
					that.onLoad()
				}
				if(res.data.error==0){
					let resultd=res.data.data
					console.log(res.data)
						that.setData({
							goodsd:resultd,
						})
						var article = resultd.goods_describe
						WxParse.wxParse('article', 'html', article, that, 5);
						let rlb=resultd.goods_img.split(",")
						let guige=resultd.goods_unit.split(",")
						that.data.spimg = that.data.spimg.concat(rlb)
						if(resultd.is_ladder_pricing==1){
							that.setData({
								pricelist:res.data.pricelist,
								havenum:res.data.havenum
								
							})
						}
						that.setData({
							spimg:that.data.spimg,
							guige:guige
						})
				}
				pageState1.finish()    // 切换为finish状态
				  // pageState1.error()    // 切换为error状态
			},
			fail() {
				 pageState1.error()    // 切换为error状态
			}
		})
	},
	onRetry(){
		this.onLoad()
	},
	pveimg(e){
		let that =this
		if(e.currentTarget.dataset.curitem){
			app.pveimg(that.data.spimg,e.currentTarget.dataset.curitem,true)
		}else{
			app.pveimg(e.currentTarget.dataset.imgurl)
		}
		
	}
})
	/*wx.request({
			url:  app.IPurl1+'order',
			data:{
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				goods_sku_id:that.data.goodsd.goods_sku_id
			},
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				// console.log(res.data)
				
				if(res.data.error==-2){
					app.checktoken(res.data.error)
					that.onLoad()
				}
				if(res.data.error==0){
					let resultd=res.data.data
					console.log(res.data.data)
					
				}
			}
		})*/