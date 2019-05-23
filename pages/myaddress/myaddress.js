//myaddress.js
var pageState = require('../../utils/pageState/index.js')
const app = getApp()

Page({
  data: {
		addresslist:[1,2,3],
    mridx:0
  },
  onLoad: function (option) {
  
  },
	onShow(){
		this.getaddlist()
	},
	selecmr(e){
		let that =this
		console.log(e.currentTarget.dataset.id)
		let id=e.currentTarget.dataset.id
		wx.request({
			url:  app.IPurl1+'useraddress',
			data:  {
					op:'moren',
					key:app.jkkey,
					tokenstr:wx.getStorageSync('tokenstr'),
					user_member_shopping_address_id :id
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
				}
				if(res.data.error==0){
					that.getaddlist()
				}
			}
		})
	},
	addressEdit(e){
		
		console.log(e.currentTarget.dataset.id)
		let address=this.data.addresslist[e.currentTarget.dataset.id]
		 address=JSON.stringify(address)
		wx.navigateTo({
			url:'/pages/addressEdit/addressEdit?address='+address
		})
	},
	addressDel(e){
		let that =this
		console.log(e.currentTarget.dataset.id)
		let id=e.currentTarget.dataset.id
		wx.showModal({
			content:"确定要删除改地址吗?",
			success(res) {
				if (res.confirm) {
					console.log('用户点击确定')
					wx.request({
						url:  app.IPurl1+'useraddress',
						data:  {
								op:'del',
								key:app.jkkey,
								tokenstr:wx.getStorageSync('tokenstr'),
								user_member_shopping_address_id :id
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
							}
							if(res.data.error==0){
								that.onLoad()
							}
						}
					})
					
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	getaddlist(){
		const pageState1 = pageState.default(this)
		pageState1.loading()    // 切换为loading状态
		let that =this
		//http://water5100.800123456.top/WebService.asmx/useraddress
		wx.request({
			url:  app.IPurl1+'useraddress',
			data:  {
					op:'list',
					key:app.jkkey,
					tokenstr:wx.getStorageSync('tokenstr')
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
					that.setData({
						addresslist:res.data.list
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
	}
})
