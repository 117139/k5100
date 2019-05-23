const app = getApp()

Page({
  data: {
    sp: [
			{type:'5100瓶装水',sp1:[{jg:'25.80'},{jg:'8.00-25.80'},{jg:'25.80'},{jg:'8.00-25.80'}]},
			{type:'家庭桶装',sp1:[{jg:'25.80'},{jg:'8.00-25.80'},{jg:'25.80'},{jg:'8.00-25.80'}]},
			{type:'冰滴咖啡',sp1:[{jg:'25.80'},{jg:'8.00-25.80'},{jg:'25.80'},{jg:'8.00-25.80'}]},
			{type:'礼券套餐',sp1:[{jg:'25.80'},{jg:'8.00-25.80'},{jg:'25.80'},{jg:'8.00-25.80'}]},
		],
		shopgroups:[],
		shoplist:[],
		tabBars:['mt1','mt2','mt3','mt4'],
		offTop:[],
		tabIndex:0,
		scrollTop:100,
		wh:0
  },
  onLoad: function () {
	 
    wx.showLoading({
    	title:'商品加载中...'
    })
		this.getshopgroup()
  },
  onShow(){
	  
  },
	onReady: function () {
		let that = this
		for(var i=0;i<this.data.tabBars.length;i++){
			let id=that.data.tabBars[i]
			const query = wx.createSelectorQuery()
			// let view = query.select("#"+id);
			query.select("#"+id).boundingClientRect(function (res) {
				// res.top // #the-id 节点的上边界坐标（相对于显示区域）
				console.log(res.top)
				let off1=that.data.offTop.length
				let up = "offTop[" + off1 + "]"
				that.setData({
					[up]:res.top
				})
			})
			query.exec();
		}
		let wh = wx.getSystemInfoSync().windowHeight
		this.setData({
			wh:wh
		})
		console.log(wh)
		wx.hideLoading()
	},
	tapTab(e) { //点击tab-bar
			console.log(e.currentTarget.dataset.tab)
	    if (this.tabIndex === e.currentTarget.dataset.tab) {
	        return false;
	    } else {					
	        // this.isClickChange = true;
	        // this.tabIndex = e.target.dataset.current
					let sTop=this.data.offTop[e.currentTarget.dataset.tab]
					this.setData({
						tabIndex :e.currentTarget.dataset.tab,
						scrollTop:sTop
					})
					
	    }
	},
	/*scroll(e) {
		// console.log(e.detail.scrollTop)
		// this.video_play = false
		let that =this
		
		for(var i=that.data.offTop.length-1;i>-1;i--){		
			if(e.detail.scrollTop>=(that.data.offTop[i]-that.data.wh/2)){
				// that.tabIndex = i;	
					that.setData({
						tabIndex:i
					})
				// that.scrollId='a'+that.tabBars[i].id
				// console.log(that.data.tabIndex)
				return
			}
		}
	},*/
	opengoods(e){
		 let id = e.currentTarget.dataset.id
		app.opengoods(id)
	},
	//获取商品分类
	getshopgroup(){
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
					that.setData({
						shopgroups:res.data.list
					})
				}
			}
		})
	},
	//获取分类的商品
	getshoplist(id){
		//http://water5100.800123456.top/WebService.asmx/shoplist
		let that = this
		wx.request({
			url:  app.IPurl1+'shoplist',
			data:{
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				pageindex:that.data.pageindex,
				pagesize:that.data.pagesize,
				goods_category_id: id,            //(分类) 
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
					that.setData({
						shopgroups:res.data.list
					})
						// that.setData({
						// 	goodsd:resultd,
						// })
						// let rlb=resultd.goods_img.split(",")
						// let guige=resultd.goods_unit.split(",")
						// that.data.spimg = that.data.spimg.concat(rlb)
						// that.setData({
						// 	spimg:that.data.spimg,
						// 	guige:guige
						// })
				}
			}
		})
	}
	
	
})
