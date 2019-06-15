//app.js
App({
	// IPurl1:'https://wx5100api.tdgjs.com/WebService.asmx/',
	IPurl1:'https://wx5100api.tdgjs.com/WebService.asmx/',
	jkkey:'server_mima',
  onLaunch: function () {
		this.getusersetting()
		this.checkSession_1()
  //   console.log(this.IPurl1)
  },
  globalData: {
    userInfo: null
  },
	getusersetting(){
		let that=this
		// 获取用户信息
		wx.getSetting({
		  success: res => {
		    console.log('16app'+JSON.stringify(res))
		    if (res.authSetting['scope.userInfo']==true) {
		      // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success(res) {
							that.globalData.userInfo = res.userInfo
							console.log(that.globalData.userInfo)
							if(that.globalData.userInfo==''||that.globalData.userInfo==null){
								wx.reLaunch({
								  url: '/pages/shouquan/shouquan',
								  fail: (err) => {
								    console.log("失败: " + JSON.stringify(err));
								  }
								})
							}
						}
					})
					var login = wx.getStorageSync('login')
		    }else{
		      wx.reLaunch({
		        url: '/pages/shouquan/shouquan',
		        fail: (err) => {
		          console.log("失败: " + JSON.stringify(err));
		        }
					})
		    }
		  }
		})
	},
	checkSession_1(){
		let that =this
	  wx.checkSession({
	    success(res) {
				console.log(res)
	      // session_key 未过期，并且在本生命周期一直有效
	      console.log("session_key 未过期，并且在本生命周期一直有效")
	    },
	    fail() {
	      // session_key 已经失效，需要重新执行登录流程
	      console.log("session_key 已经失效")
	      // 重新登录
	      that.dologin()
	    }
	  })
	},
	checktoken(res){
		if(res==-2){
			this.dologin()
		}
	},
	dologin(){
		let that =this
		wx.login({
		  success: function (res) {
				// 发送 res.code 到后台换取 openId, sessionKey, unionId
				
				console.log(that.IPurl1)
		    // const url =   
		    let data = {
					key:'server_mima',
					code:res.code
		    }
				let rcode=res.code
				console.log(res.code)
				wx.request({
					url:  that.IPurl1+'login', 
					// url:'http://water5100.800123456.top/WebService.asmx/login',
					data: data,
					header: {
						'content-type': 'application/x-www-form-urlencoded' 
					},
					dataType:'json',
					method:'POST',
					success(res) {
						console.log(res.data)
						if(res.data.error==0){
							console.log('登录成功')
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
							wx.setStorageSync('appcode', rcode)
						}
						if(res.data.error==2){
							wx.setStorageSync('tokenstr', res.data.tokenstr)
							wx.setStorageSync('appcode', rcode)
							// wx.reLaunch({
							// 	url:'/pages/login/login'
							// })
						}
					}
				})
		  }
		})
	},
	userInfoReadyCallback(){
		// wx.request({
		// 	url: this.IPurl1+'test.php', 
		// 	data: {
		// 		x: '',
		// 		y: ''
		// 	},
		// 	header: {
		// 		'content-type': 'application/json' // 默认值
		// 	},
		// 	success(res) {
		// 		console.log(res.data)
		// 	}
		// })	
	},
	//打开商品详情页
	opengoods(id,sku_info_id) {
		console.log(id)
	  wx.navigateTo({
	    url: '/pages/goodsDetails/goodsDetails?id=' + id+'&sku_info_id='+sku_info_id
	  })
	},
	openOrder(id,type){
		console.log(id)
		if(type){
			wx.navigateTo({
			  url: '/pages/Order/Order?id=' + id+'&type='+type
			})
		}else{
			wx.navigateTo({
			  url: '/pages/Order/Order?id=' + id
			})
		}
		
	},
	goaddress(id){
		wx.navigateTo({
		  url: '/pages/myaddress/myaddress?id=' + id
		})
	},
	
	//获取支付信息
	Pay(order_info_id,type){
		let that=this
		let datas
		if(type==='info'){
			datas= {
				op:'pay',
				key:that.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				order_info_id: order_info_id
			}
		}
		if(type==='no'){
			datas= {
				op:'pay',
				key:that.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				partner_trade_no: order_info_id
			}
		}
		console.log(JSON.stringify(datas))
		wx.request({
			url: that.IPurl1 + 'order',
			data: datas,
			header: {
					'content-type': 'application/x-www-form-urlencoded' // 默认值
			},
			method: "POST",
			success: function (res) {
				console.log('194'+res.data);
				if(res.data.error==0){
					that.doWxPay(res);
				}else{
					
				}
				
			},
			fail: function (err) {
				wx.showToast({
						icon: "none",
						title: '服务器异常，清稍候再试'
				})
			},
		});
	},
	doWxPay(param) {
		// wx.showToast({
		// 	title:'doWxPay'
		// })
		//小程序发起微信支付
		wx.requestPayment({
			timeStamp: param.data.timeStamp,//记住，这边的timeStamp一定要是字符串类型的，不然会报错
			nonceStr: param.data.nonceStr,//随机字符串
			package: param.data.package,
			signType: 'MD5',
			paySign: param.data.paySign,
			success: function (event) {
				// success
				console.log(event);
				
				wx.redirectTo({
					url: '/pages/OrderList/OrderList?id=-2'
				})
				wx.showToast({
					title: '支付成功',
					icon: 'success',
					duration: 1000
				});
			},
			fail: function (error) {
				// fail
				console.log("支付失败")
				
				wx.redirectTo({
					url: '/pages/OrderList/OrderList?id=0'
				})
				wx.showToast({
					title: '支付失败',
					icon: 'success',
					duration: 1000
				});
				console.log(error)
			},
			complete: function () {
				// complete
				console.log("pay complete")
			}
		 
		});
	},
	pveimg(urls,current,type){
		let urls1=[]
		if(!type){
			urls1[0]=urls
		}else{
			urls1=urls
		}
		wx.previewImage({
			current: current, // 当前显示图片的http链接
			urls: urls1 // 需要预览的图片http链接列表
		})
	}
})