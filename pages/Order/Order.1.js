//logs.js
const app = getApp()

Page({
  data: {
		goods_sku_id:'',
		address:wx.getStorageSync('morenaddress'),
		goodslist:[],        //商品列表
		spimg:[],            //商品图片
		goodsguige:'',            //商品规格
		goodsnum:'',
		ztaddress:0,
		zttime:0,
		goods_sele:[],
		columns:['仓库自提'],
		columns1:['仓库1','仓库2','仓库3','仓库4'],
		columns2:['时间1','时间2','时间3','时间4'],
		show0:0,
		show1:0,
		show2:0,
		sum:0
  },
  onLoad: function (option) {
    if(option.id){
			console.log(option.id)
			this.setData({
				goods_sku_id:option.id
			})
		}
		if(option.goodsguige){
			this.setData({
				goodsguige:option.goodsguige,
				goodsnum:option.goodsnum
			})
		}
		this.getGoodsDetails(option.id)
		this.getskuadd()
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
	//address
	bchange1(e){
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      show1: e.detail.value,
			ztaddress:this.data.columns1[e.detail.value].id,
			zttime:this.data.columns2[e.detail.value][0].id
    })
		// that.setData({
		// 	ztaddress:that.data.columns1[0].id,
		// 	zttime:that.data.columns2[0][0].id
		// })
  },
	//time
	bchange2(e){
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      show2: e.detail.value,
			zttime:this.data.columns2[this.data.show1][e.detail.value].id
    })
  },
	/*计算价格*/
	countpri(){
		let heji=0
		let var2= this.data.goods_sele
		for (let i in var2) {
			if(var2[i].xuan==true){
				if(var2[i].laddermsgs.Totalpri&&var2[i].laddermsgs.Totalpri!==0){
					if(heji==0){
						heji =Math.round((var2[i].laddermsgs.Totalpri*100*1000)/1000)
					}else{
						heji +=var2[i].laddermsgs.Totalpri*100
					}
				}else{
					heji +=var2[i].num*(var2[i].pri*100)
				}
			}
		}
		console.log(heji)
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
		console.log(hj1+'.'+hj2)
		heji=hj1+'.'+hj2
		this.setData({
			sum:heji
		})
	},
	subbtn(){
		console.log(app.IPurl1)
		let that = this
		let data
		if(that.data.goods_sku_id!==''){
			data={
				op:'orderpub',
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				goods_sku_id:that.data.goods_sku_id,	//商品ID
				logistics_self:0,											//自提
				// user_member_shopping_address_id:that.data.address.user_member_shopping_address_id, //地址id(物流选择)
				shop_store_house_id:that.data.ztaddress,
				shop_delivery_time_id:that.data.zttime,
				num:that.data.goodsnum,
				goods_unit:that.data.goodsguige
			}
		}
		wx.request({
			url:  app.IPurl1+'order',
			data:data,
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
					console.log(res.data)
				
				}
			}
		})
	
		/*wx.request({
			url: app.IPurl1 + 'wxPay',
			data: {
				openId: openId
				// amount: amount,
				// openId: openId
			},
			header: {
					'content-type': 'application/x-www-form-urlencoded' // 默认值
			},
			method: "POST",
			success: function (res) {
				console.log(res);
				that.doWxPay(res.data);
			},
			fail: function (err) {
				wx.showToast({
						icon: "none",
						title: '服务器异常，清稍候再试'
				})
			},
		});*/
		wx.navigateTo({
			url:'../OrderDetails/OrderDetails'
		})
		
	},
	doWxPay(param) {
		//小程序发起微信支付
		wx.requestPayment({
			timeStamp: param.data.timeStamp,//记住，这边的timeStamp一定要是字符串类型的，不然会报错
			nonceStr: param.data.nonceStr,
			package: param.data.package,
			signType: 'MD5',
			paySign: param.data.paySign,
			success: function (event) {
				// success
				console.log(event);
				wx.showToast({
					title: '支付成功',
					icon: 'success',
					duration: 2000
				});
			},
			fail: function (error) {
				// fail
				console.log("支付失败")
				console.log(error)
			},
			complete: function () {
				// complete
				console.log("pay complete")
			}
		 
		});
	},
	goaddress(){
		app.goaddress()
	},
	//单品
	getGoodsDetails(id){
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
					let resultd=res.data
					console.log(res.data)
					that.data.goodslist.push(res.data)
						that.setData({
							goodslist:that.data.goodslist,
						})
						
						let shopimg=resultd.data.goods_img.split(",")
						// let guige=resultd.data.goods_unit.split(",")
						// // that.data.spimg = that.data.spimg.concat(rlb)
						console.log(shopimg[0])
						that.data.spimg.push(shopimg[0])
						that.setData({
							spimg:that.data.spimg
						})
						if(that.data.goods[i].order_cart.is_ladder_pricing==1){
							
							arra.push({
								xuan:false,
								pri:that.data.goods[i].order_cart.internal_price,
								num:that.data.goods[i].order_cart.goods_count,
								order_cart_id:that.data.goods[i].order_cart.order_cart_id,
								laddermsgs:that.ladderpri(i)
							})
						}else{
							arra.push({
								xuan:false,
								pri:that.data.goods[i].order_cart.internal_price,
								num:that.data.goods[i].order_cart.goods_count,
								order_cart_id:that.data.goods[i].order_cart.order_cart_id
							})
						}
						that.setData({
							goods_sele:arra
						})
				}
			}
		})
	},
	//gwc
	getGoodsDetails(id){
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
					// let resultd=res.data
					// console.log(res.data)
					// that.data.goodslist.push(res.data)
					// 	that.setData({
					// 		goodslist:that.data.goodslist,
					// 	})
						
						// let shopimg=resultd.data.goods_img.split(",")
						// let guige=resultd.data.goods_unit.split(",")
						// // that.data.spimg = that.data.spimg.concat(rlb)
						// console.log(shopimg[0])
						// that.data.spimg.push(shopimg[0])
						// that.setData({
						// 	spimg:that.data.spimg
						// })
						
						
						let resultd=res.data.list
						that.setData({
							goods:resultd
						})
						let imgb=[]
						for(let i in resultd){
							// console.log(rlist[i].goods_img)
							let rlb=resultd[i].order_cart.goods_img.split(",")
							imgb.push(rlb[0])
						}
						that.data.spimg = that.data.spimg.concat(imgb)
						that.setData({
							spimg:that.data.spimg
						})
						if(that.data.goods[i].order_cart.is_ladder_pricing==1){
							
							arra.push({
								xuan:false,
								pri:that.data.goods[i].order_cart.internal_price,
								num:that.data.goods[i].order_cart.goods_count,
								order_cart_id:that.data.goods[i].order_cart.order_cart_id,
								laddermsgs:that.ladderpri(i)
							})
						}else{
							arra.push({
								xuan:false,
								pri:that.data.goods[i].order_cart.internal_price,
								num:that.data.goods[i].order_cart.goods_count,
								order_cart_id:that.data.goods[i].order_cart.order_cart_id
							})
						}
						that.setData({
							goods_sele:arra
						})
				}
			}
		})
	},
	//获取地点时间
	getskuadd(){
		//http://water5100.800123456.top/WebService.asmx/shop_store_house_list
		let that = this
			wx.request({
				url:  app.IPurl1+'shop_store_house_list',
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
					// console.log(res)
					
					if(res.data.error==-2){
						app.checktoken(res.data.error)
						that.onLoad()
					}
					if(res.data.error==0){
						let resultd=res.data.list
						// console.log(res.data.list)
						// that.data.goodslist.push(res.data)
					
						let ckuadd=[]
						let ctime=[]
							for(let i in resultd){
								let ctime1=[]
								let addjson={
									'name':resultd[i].store_house.store_house_name,
									'id':resultd[i].store_house.shop_store_house_id
								}
								ckuadd.push(addjson)
								for(let j in resultd[i].timelist){
									let timejson={}
									let asd=resultd[i].timelist[j]
									// console.log(asd)
									let timejsontime=asd.delivery_date + asd.start_time+'-'+asd.end_time
									let timejsonid=asd.shop_delivery_time_id
									// let timejson="{time:"+timejsontime+",id:"+timejsonid+"}"
									timejson={
										'time':timejsontime,
										'id':timejsonid
									}
									ctime1.push(timejson)
								}
								ctime.push(ctime1)
							}
							that.setData({
								columns1:ckuadd,
								columns2:ctime,
								
							})
							that.setData({
								ztaddress:that.data.columns1[0].id,
								zttime:that.data.columns2[0][0].id
							})
					}
				}
			})
		
	},
	//阶梯价
	ladderpri(idx,num){
		
		let that = this
		let ygnum=that.data.goods[idx].havenum  //已购
		let jt=that.data.goods[idx].pricelist  //规则
		let nownum=that.data.goods[idx].order_cart.goods_count//本次购买数量
		if(num){
			nownum=num
		}
		// let numz=ygnum+nownum
		let nownum1 //定义临时变量
		let numlen //定义单个阶梯的限购数量
		let jtlist=[]        //阶梯列表
		let jtnum=[]         //阶梯数量
		let jtTotal=[]         //阶梯总价
		let numladd=[]      //阶梯的区间
		let priladd=[]      //阶梯的价格
		let Totalpri=0
		let laddermsg=[]
		for(let i in jt){
			let lownum=jt[i].lower_num
			let upnum=jt[i].upper_num
			let bpri=jt[i].price
			// console.log(lownum)
			// console.log(upnum)
			
			let jtzsy=jt[i].limit_num-jt[i].saled_num
			if(lownum-1<=ygnum&&ygnum<upnum){ //根据已购获取开始阶梯
	         
				let item1
				item1=upnum-ygnum        //n1阶梯限售剩余
				
				if(jtzsy<item1){
					item1=jtzsy
				}
				if(item1==0){
					continue   //售罄
				}
				if(nownum<=item1){         //限售剩余足够
					Totalpri +=100*bpri*nownum/100
					let ladderOne={
						'numladd':lownum+'-'+upnum,
						'jtnum':nownum,
						'priladd':bpri,
						'jtTotal':100*bpri*nownum/100
					}
					laddermsg.push(ladderOne)
					break;   //结束
				}else{                   //限售剩余不足
					nownum1=nownum-item1
					let ladderOne={
						'numladd':lownum+'-'+upnum,
						'jtnum':item1,
						'priladd':bpri,
						'jtTotal':100*bpri*item1/100
					}
					Totalpri +=100*bpri*item1/100
					laddermsg.push(ladderOne)
				}
			}
			if(ygnum<lownum){   //后续阶梯（最小值大于已购）
				numlen=upnum-lownum+1   //当前阶梯的限购数量
				if(jtzsy<numlen){
					numlen=jtzsy
				}
				if(numlen==0){
					continue   //售罄
				}
				if(nownum1<=numlen){  //限售剩余足够
					let ladderOne={
						'numladd':lownum+'-'+upnum,
						'jtnum':nownum1,
						'priladd':bpri,
						'jtTotal':100*bpri*nownum1/100
					}
					Totalpri +=100*bpri*nownum1/100
					laddermsg.push(ladderOne)
					break;   //结束
				}else{                   //限售剩余不足
					nownum1=nownum1-numlen
	
					let ladderOne={
						'numladd':lownum+'-'+upnum,
						'jtnum':numlen,
						'priladd':bpri,
						'jtTotal':100*bpri*numlen/100
					}
					Totalpri +=100*bpri*numlen/100
					laddermsg.push(ladderOne)
				}
			}
		}
	
		let laddermsgs={
			'laddermsg':laddermsg,
			'Totalpri':Totalpri
		}
		// console.log(laddermsgs)
		return laddermsgs
	}
})
