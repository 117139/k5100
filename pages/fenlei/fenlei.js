var pageState = require('../../utils/pageState/index.js')
const app = getApp()
Page({
  data: {
    sp: [],
		shopgroups:[],   //shopgroup
		shoplist:[],     //shoplist
		spimg:[],        //shopimg
		pageindex:1,
		pagesize:10,
		gid:'',
		more:true,
		tabBars:['mt1','mt2','mt3','mt4'],
		offTop:[],
		tabIndex:0,
		scrollTop:100,
		wh:0
  },
  onLoad: function () {
		let wh = wx.getSystemInfoSync().windowHeight
		this.setData({
			wh:wh
		})
		this.getshopgroup()
  },
  onShow(){
	  
  },
	onReady: function () {
		let that = this
		wx.hideLoading()
	},
	tapTab(e) { //点击tab-bar
	let that =this
			console.log(e.currentTarget.dataset.tab)
			let datas=e.currentTarget.dataset
			console.log(datas)
	    if (that.tabIndex === datas.tab) {
	        return false;
	    } else {
				that.setData({
					tabIndex :datas.tab,
					gid :datas.gid
				})
				console.log(datas.gid)
	      that.getshoplist(datas.gid,true) 
	    }
	},
	opengoods(e){
		 let id = e.currentTarget.dataset.id
		app.opengoods(id)
	},
	//获取商品分类
	getshopgroup(){
		//状态控制
		const pageState1 = pageState.default(this)
		pageState1.loading()    // 切换为loading状态
		//http://water5100.800123456.top/WebService.asmx/shopgroup
		let that = this
		wx.request({
			url:  app.IPurl1+'shopgroup',
			data:{
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr')
			},
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				console.log(res)
				
				if(res.data.error==-2){
					app.checktoken(res.data.error)
					that.onLoad()
				}
				if(res.data.error==0){
					let resultd=res.data
					console.log(res.data.list)
					for(let i in res.data.list){
						if(res.data.list[i].father_id==0){
							that.setData({
								shopgroups:res.data.list,
								gid:res.data.list[i].goods_category_id,
								tabIndex:i
							})
							
							that.getshoplist(res.data.list[i].goods_category_id,true)
							break;
						}
					}
					
				}
				pageState1.finish()    // 切换为finish状态
			},
			fail() {
				 pageState1.error()    // 切换为error状态
			}
		})
	},
	//获取分类的商品
	getshoplist(id,ResetG){
		//http://water5100.800123456.top/WebService.asmx/shoplist
		let gid
		let that = this
		if(id){
			gid=id
		}else{
			gid=that.data.gid
		}
		wx.request({
			url:  app.IPurl1+'shoplist',
			data:{
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				pageindex:that.data.pageindex,
				pagesize:that.data.pagesize,
				goods_category_id: gid,            //(分类) 
			},
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				console.log(res.data.list)
				let rlist=res.data.list
				
				if(res.data.error==-2){
					app.checktoken(res.data.error)
					setTimeout(function(){
						that.onLoad()
					},500)
				}
				if(res.data.error==0){
					if(ResetG){
						let resetK=[]
						that.setData({
							shoplist:resetK,
							pageindex:1
						})
					}
					if(rlist.length>0){
						that.setData({
							shoplist:rlist,
							pageindex:that.data.pageindex++
						})
						let imgb=[]
						for(let i in rlist){
							console.log(rlist[i].goods_img)	
							let rlb=rlist[i].goods_img.split(",")
							imgb.push(rlb[0])
						}
						that.data.spimg = that.data.spimg.concat(imgb)
						that.setData({
							spimg:that.data.spimg
						})
					}
					if(rlist.length<10){
						console.log('没了')
						that.setData({
							more:false
						})
					}
				}
			}
		})
	},
	onRetry(){
		this.getshopgroup()
	}
	
	
})
