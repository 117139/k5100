//logs.js
var pageState = require('../../utils/pageState/index.js')
const app = getApp()

Page({
  data: {
		goods:[],
		spimg:[],
		shopNum:[],
    qujan:[],
		columns:['仓库自提','普通配送'],
		columns1:['仓库1','仓库2','仓库3','仓库4'],
		columns2:['时间1','时间2','时间3','时间4'],
		show0:0,
		show1:0,
		show2:0,
		sum:0,
		otype:-2
  },
  onLoad: function (option) {
  //   if(option.id){
		// 	console.log(option.id)
		// }
		let hmtltit
		if(option.id==-2){
			hmtltit="全部订单"
		}else if(option.id==0){
			hmtltit="未支付"
		}else if(option.id==1){
			hmtltit="待取货"
		}else if(option.id==3){
			hmtltit="已完成"
		}
		console.log(hmtltit)
		wx.setNavigationBarTitle({
			title: hmtltit
		})
		this.setData({
			otype:option.id
		})
		this.getOrderList(option.id)
		
  },
	onReady(){
		this.countpri()
	},
	bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      show0: e.detail.value
    })
  },
	bchange1(e){
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      show1: e.detail.value
    })
  },
	bchange2(e){
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      show2: e.detail.value
    })
  },
	//删除
	cancelOrder(e){
		let that =this
		console.log('picker发送选择改变，携带值为', e.detail.value)
		let oid=e.currentTarget.dataset.oid
		wx.showModal({
			title: '提示',
			content: '是否取消该订单?',
			success (res) {
				if (res.confirm) {
					console.log('用户点击确定')
					wx.request({
						url:  app.IPurl1+'order',
						data:{
							op:'del',
							order_info_id:oid,
							key:app.jkkey,
							tokenstr:wx.getStorageSync('tokenstr')
						},
						header: {
							'content-type': 'application/x-www-form-urlencoded' 
						},
						dataType:'json',
						method:'POST',
						success(res) {
							if(res.data.error==-2){
								app.checktoken(res.data.error)
								that.onLoad()
							}
							if(res.data.error==0){
								wx.showToast({
									title: '删除成功',
									duration: 1000
								});
								that.getOrderList(that.data.otype)
							}else{
								wx.showToast({
									title: res.data.returnstr,
									duration: 1000
								});
							}
							
						
						},
						fail() {
							 wx.showToast({
							 	title: '操作失败',
							 	duration: 1000
							 });
						}
					})
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
		
	},
	/*计算价格*/
	countpri(){
		let heji=0
		let var2= this.data.goods
		for (let i in var2) {
				heji +=var2[i].num*(var2[i].pri*100)
				let zj=var2[i].num*(var2[i].pri*100)
				if(zj==0){
					this.setData({
						sum:'0.00'
					})
					return
				}else{
					zj=zj+"'"
				}
				if(zj.length<4){
					zj='0000'+zj
					zj=zj.substr(-4);
					// console.log(zj)
				}
				
				let zj1 = zj.substring(0, zj.length-3);
				let zj2 = zj.substring( zj.length-3, zj.length-1);
				// console.log(zj1+'.'+zj2)
				zj=zj1+'.'+zj2
				this.data.goods[i].zj=zj
				this.setData({
					goods:this.data.goods
				})
		}
		// console.log(heji)
		if(heji==0){
			this.setData({
				sum:'0.00'
			})
			return
		}else{
			heji=heji+"'"
		}
		if(heji.length<4){
			heji='0000'+heji
			heji=heji.substr(-4);
			// console.log(heji)
		}
		
		let hj1 = heji.substring(0, heji.length-3);
		let hj2 = heji.substring( heji.length-3, heji.length-1);
		// console.log(hj1+'.'+hj2)
		heji=hj1+'.'+hj2
		this.setData({
			sum:heji
		})
	},

	shouhuoBtn(){
		console.log('确认收货')
		wx.showToast({
			title: '确认收货操作',
			icon: 'success',
			duration: 2000
		})
		
	},

	//获取列表
	getOrderList(type){
		const pageState1 = pageState.default(this)
		pageState1.loading()    // 切换为loading状态
		let that = this
		//http://water5100.800123456.top/WebService.asmx/order
		wx.request({
			url:  app.IPurl1+'order',
			data:{
				op:'mylist',
				order_status:type,
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr')
			},
			header: {
				'content-type': 'application/x-www-form-urlencoded' 
			},
			dataType:'json',
			method:'POST',
			success(res) {
				if(res.data.error==-2){
					app.checktoken(res.data.error)
					that.onLoad()
				}
				if(res.data.error==0){
	
						let resultd=res.data.list
						// console.log(res.data.list)
						that.setData({
							goods:resultd
						})
						let imgb=[]
						let shopnum=[]
						for(let i in resultd){
							// console.log(rlist[i].goods_img)
							// let rlb=resultd[i].order_product_list.goods_img.split(",")
							let r2d=resultd[i].order_product_list
							let imgb1=[]
							let shopnum1=0
							for(let j in r2d){
								let rlb=r2d[j].goods_img.split(",")
								imgb1.push(rlb[0])
								shopnum1 +=r2d[j].goods_count
							}
							shopnum.push(shopnum1)
							imgb.push(imgb1)
						}
						// console.log(shopnum)
						that.data.spimg = that.data.spimg.concat(imgb)
						that.data.shopNum = that.data.shopNum.concat(shopnum)
						that.setData({
							spimg:that.data.spimg,
							shopNum:shopnum
						})
				}
				pageState1.finish()    // 切换为finish状态
			},
			fail() {
				 pageState1.error()    // 切换为error状态
			}
		})
	},
	//订单详情
	goOrderDetails(e){
		console.log(e.currentTarget.dataset.id)
		wx.navigateTo({
			url:'/pages/OrderDetails/OrderDetails?id='+e.currentTarget.dataset.id
		})
	},
	//付款
	pay(e){
		let oid=e.currentTarget.dataset.oid
		app.Pay(oid,'info')
	},
	onRetry(){
		this.onLoad()
	}
})
