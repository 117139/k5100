//logs.js
const app = getApp()

Page({
  data: {
    array:
		 [
			'中国国际航空股份有限公司',
			'中国国际航空股份有限公司2',
			'中国国际航空股份有限公司3',
		],
		picklist1:[],
		tel:'',
		gsidx:0,
		yzm:'',
		setstate:0,
		time:60,
		wxcode:'',
		tokenstr:''
  },
  onLoad: function (option) {
			let that =this
			that.setData({
				wxcode:wx.getStorageSync('appcode'),
				tokenstr: wx.getStorageSync('tokenstr')
			})
			that.getcompany()
			
		wx.login({
			success: function (res) {
				// 发送 res.code 到后台换取 openId, sessionKey, unionId
				let rcode=res.code
				wx.setStorageSync('appcode', rcode)
				that.setData({
					wxcode:rcode
				});
			}
		})
  },
	oniptblur(e){
		console.log(e.detail.value)
		this.setData({
			tel:e.detail.value
		})
	},
	getcode(){
		let that =this
		wx.showModal({
			title:'获取验证码'
		})
		wx.request({
			url:  app.IPurl1+'sendcode',
			data:  {
					key:'server_mima',
					tokenstr:that.data.tokenstr,
					tel:that.data.tel
		    },
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				console.log(res.data.code)
				that.setData({
					yzm:res.data.code.substr(0,4)
				})
				console.log(that.data.yzm)
				that.codetime()
			}
		})
		
	},
	codetime(){
		let that =this
		let time=60
		let st=setInterval(function(){
		    if(time==0){
		        that.setData({
							setstate:0,
						})
		        clearInterval(st);
		    }else{
		        let news=time--;
						console.log(news)
						that.setData({
							setstate:1,
							time:news
						})
		        
		    }
		},1000);
	},
	getcompany(){
		let that = this
		console.log(that.data.tokenstr)
		// http://water5100.800123456.top/WebService.asmx/shop_channel_list
		wx.request({
			url:  app.IPurl1+'shop_channel_list',
			data:  {
					key:'server_mima',
					tokenstr:that.data.tokenstr
				},
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				console.log(res)
				console.log(res.data.list)
				let rlist=res.data.list
				let picklist=[]
				for(let i in rlist){
					picklist.push(rlist[i].shop_channel_name)
				}
				that.setData({
					picklist1:picklist,
					array:res.data.list
				})
				
			}
		})
		
	},
	//提交表单
	formSubmit(e) {
		console.log(app.globalData.userInfo)
		let uinfo=app.globalData.userInfo
		console.log(uinfo.nickName)
		console.log(uinfo.avatarUrl)
		let that =this
	  console.log('form发生了submit事件，携带数据为：', e.detail.value)
		let formresult=e.detail.value
		if (formresult.name=='') {
			wx.showToast({
				title: '姓名不能为空',
				duration: 2000,
				icon:'none'
			});
			return false;
		}
		if (!(/^1\d{10}$/.test(formresult.tel))) {
			wx.showToast({
				title: '手机号码有误',
				duration: 2000,
				icon:'none'
			});
			return false;
		}
		if (formresult.code=='') {
			wx.showToast({
				title: '验证码不能为空',
				duration: 2000,
				icon:'none'
			});
			return false;
		}
		// if(formresult.code!=that.data.yzm) {
		// 	wx.showToast({
		// 		title: '验证码错误',
		// 		duration: 2000,
		// 		icon:'none'
		// 	});
		// 	return false;
		// }
		wx.request({
			url:  app.IPurl1+'login',
			data:  {
					key:'server_mima',
					code:that.data.wxcode,
					tokenstr:that.data.tokenstr,
					nickname:uinfo.nickName,
					headpicurl:uinfo.avatarUrl,
					tel:formresult.tel,
					name:formresult.name,
					shop_channel_id:formresult.company,
		    },
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				console.log(res.data)
				
				if(res.data.error==0){
					wx.reLaunch({
						url:'/pages/index/index'
					})
					wx.setStorageSync('login', 'login')
					wx.setStorageSync('tokenstr', res.data.tokenstr)
					wx.setStorageSync('morenaddress', res.data.user_member_shopping_address)
					/*
					address:"2321231323"
					city:"北京市"
					county:"东城区"
					create_time:"05/14/2019 15:50:41"
					default_add:1
					mobile:"18334774129"
					name:"苏鑫"
					province:"北京市"
					update_time:"05/14/2019 15:50:41"
					user_member_id:2
					user_member_shopping_address_id:3
					*/
					// wx.setStorageSync('appcode', rcode)
				}
			}
		})
		
	},
	bindGsChange(e){
		console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      gsidx: e.detail.value
    })
	}
})
