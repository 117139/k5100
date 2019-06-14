//order.js
var pageState = require('../../utils/pageState/index.js')
const app = getApp()

Page({
  data: {
		paykg:true,
		goods_sku_id:'',
		address:wx.getStorageSync('morenaddress'),
		goodslist:[],        //商品列表
		spimg:[],            //商品图片
		goodsguige:'',            //商品规格
		dbggtype:-1,        //直购的规格下标
		goodsnum:'',
		ztaddress:0,
		zttime:0,
		goods_sele:[],
		idg:[],//id数组
		columns:['仓库自提'],
		columns1:['仓库1','仓库2','仓库3','仓库4'],
		columns2:['时间1','时间2','时间3','时间4'],
		show0:0,
		show1:0,
		show2:0,
		sum:0
  },
  onLoad: function (option) {
    console.log(option)
		if(option.type){
			
			let idg=option.id.split(",")
			console.log(idg)
			this.setData({
				idg:idg
			})
			this.getGoodsDetailsgwc()
		}else{
	
			this.setData({
				goods_sku_id:option.id
			})
			
			this.getGoodsDetails(option.id)

		}
		if(option.goodsguige){
			this.setData({
				goodsguige:option.goodsguige,
				goodsnum:option.goodsnum
			})
		}
		if(option.ggtype){
			this.setData({
				dbggtype:option.ggtype
			})
		}
		this.getskuadd()  //获取时间地点
		
  },
	onReady(){
		
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
		// console.log(this.data.goods_sele)
		// console.log(var2)
		for (let i in var2) {
			if(var2[i].xuan==true){
				if(var2[i].laddermsgs){
					
						heji +=var2[i].laddermsgs.Totalpri*100

				}else{
					heji +=var2[i].num*(var2[i].pri*100)
				}
			}
			
			
		}
		console.log(heji)
		heji=(heji/100).toFixed(2)
		this.setData({
			sum:heji
		})
	},
	subbtn(){
		
		console.log(app.IPurl1)
		let that = this
		let data
		if(that.data.paykg==false){
			return
		}else{
			wx.showLoading({
				title:'订单提交中...'
			})
			that.setData({
				paykg:false
			})
		}
		if(that.data.goods_sku_id!==''){
			data={
				op:'orderpub',
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				goods_sku_id:that.data.goods_sku_id,	//商品ID
				sku_info_id:that.data.goodslist[0].goods_sku_info[that.data.dbggtype].sku_info_id,
				logistics_self:0,											//自提
				// user_member_shopping_address_id:that.data.address.user_member_shopping_address_id, //地址id(物流选择)
				shop_store_house_id:that.data.ztaddress,
				shop_delivery_time_id:that.data.zttime,
				num:that.data.goodsnum,
				goods_unit:that.data.goodsguige
			}
		}else{
			let idg=that.data.idg.join(',')
			console.log(idg)
			// return
			data={
				op:'orderpub',
				key:app.jkkey,
				tokenstr:wx.getStorageSync('tokenstr'),
				carids:idg,
				logistics_self:0,											//自提
				shop_store_house_id:that.data.ztaddress,
				shop_delivery_time_id:that.data.zttime,
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
				
				wx.hideLoading()
				console.log(res)
				
				if(res.data.error==-2){
					app.checktoken(res.data.error)
					that.onLoad()
				}else if(res.data.error==0){
					let resultd=res.data
					console.log(res.data)
					if(res.data.order_info_id){
						console.log('178info')
						app.Pay(res.data.order_info_id,'info')
					}
					if(res.data.partner_trade_no){
						console.log('182no')
						app.Pay(res.data.partner_trade_no,'no')
					}
				}else{
					that.setData({
						paykg:true
					})
				}
			},
			fail(res) {
				

				wx.hideLoading()
				that.setData({
					paykg:true
				})
				wx.showToast({
					title: '提交失败',
					icon: 'none',
					duration: 1000
				})
			}
		})
	
		
		// wx.navigateTo({
		// 	url:'../OrderDetails/OrderDetails'
		// })
		
	},
	goaddress(){
		app.goaddress()
	},
	//单品
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
						let arra=[]
						if(that.data.goodslist[0].goods_total_limit!=''){
							
							arra.push({
								 xuan:true,
								// pri:res.data.shopinfo_sku_price_list[dbggidx].goods_sku_info.internal_price,
								num:that.data.goodsnum,
								// order_cart_id:that.data.goodslist[0].order_cart.order_cart_id,
								laddermsgs:that.ladderpri(0)
							})
						}else{
							var dbggidx=that.data.dbggtype
							console.log(dbggidx)
							let ss=res.data.shopinfo_sku_price_list[dbggidx].goods_sku_info.internal_price * that.data.goodsnum
							
							let Totalpri=ss.toFixed(2)
							
							arra.push({
								xuan:true,
								pri:res.data.shopinfo_sku_price_list[dbggidx].goods_sku_info.internal_price,
								num:that.data.goodsnum,
								Totalpri:Totalpri
							})
						}
						that.setData({
							goods_sele:arra
						})
						that.countpri()
				}
				pageState1.finish()    // 切换为finish状态
				  // pageState1.error()    // 切换为error状态
			},
			fail() {
				 pageState1.error()    // 切换为error状态
			}
		})
	},
	//gwc
	getGoodsDetailsgwc(id){
		const pageState1 = pageState.default(this)
		pageState1.loading()    // 切换为loading状态
		let that = this
		wx.request({
			url:  app.IPurl1+'shopcar',
			data:{
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
				// console.log(res.data)
				
				if(res.data.error==-2){
					app.checktoken(res.data.error)
					that.onLoad()
				}
				if(res.data.error==0){

						let resultd=res.data.list
						that.setData({
							goodslist:resultd
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
						//设置选中的数组
						let arra=[]
						for (let i=0;i<resultd.length;i++) {
							let aa=resultd[i].order_cart
							let showkg=false
							for(let s in that.data.idg){
								if(aa.order_cart_id==that.data.idg[s]){
									showkg=true
									break
								}
							}
							if(resultd[i].order_cart.is_ladder_pricing==1){
								
								arra.push({
									xuan:showkg,
									pri:resultd[i].order_cart.internal_price,
									num:resultd[i].order_cart.goods_count,
									order_cart_id:resultd[i].order_cart.order_cart_id,
									goods_sku_id:resultd[i].order_cart.goods_sku_id,
									laddermsgs:that.ladderpri1(i)
								})
							}else{
								
								let ss=aa.internal_price * aa.goods_count
								
								let Totalpri=ss.toFixed(2)
								
								arra.push({
									xuan:showkg,
									pri:resultd[i].order_cart.internal_price,
									num:resultd[i].order_cart.goods_count,
									Totalpri:Totalpri,
									goods_sku_id:resultd[i].order_cart.goods_sku_id,
									order_cart_id:resultd[i].order_cart.order_cart_id
								})
							}
						}
						that.setData({
							goods_sele:arra
						})
						that.ladderpri_gb()
						that.countpri()
				}
				pageState1.finish()    // 切换为finish状态
				  // pageState1.error()    // 切换为error状态
			},
			fail() {
				 pageState1.error()    // 切换为error状态
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
	//阶梯价单
	ladderpri(idx,num){
		
		let that = this
		let ygnum=that.data.goodslist[idx].havenum  //已购
		let jt=that.data.goodslist[idx].goods_total_limit  //规则
		let jtpri=that.data.goodslist[idx].shopinfo_sku_price_list[that.data.dbggtype].goods_ladder_pricing_list  //规则
		let nownum
		if(that.data.goodsnum!==''){
			nownum=that.data.goodsnum
		}else{
			nownum=that.data.goodslist[idx].order_cart.goods_count//本次购买数量
		}
		
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
			let bpri=jtpri[i].price
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
		Totalpri=Totalpri.toFixed(2)
		let laddermsgs={
			'laddermsg':laddermsg,
			'Totalpri':Totalpri
		}
		// console.log(laddermsgs)
		return laddermsgs
	},
	//阶梯价wgc初始化
	ladderpri1(idx,num){
		// for(var i=0;i<idx;i++){
		// 	
		// }
		let that = this
		let ygnum=that.data.goodslist[idx].havenum  //已购
		let jt=that.data.goodslist[idx].limitlist  //规则
		var jtpri=that.data.goodslist[idx].pricelist  //规则价格
		let nownum=that.data.goodslist[idx].order_cart.goods_count//本次购买数量
		if(num){
			nownum=num
		}
		// let numz=ygnum+nownum
		// console.log(jtpri)
		let nownum1 //定义临时变量
		let numlen //定义单个阶梯的限购数量
		let jtlist=[]        //阶梯列表
		let jtnum=[]         //阶梯数量
		let jtTotal=[]         //阶梯总价
		let numladd=[]      //阶梯的区间
		let priladd=[]      //阶梯的价格
		let Totalpri=0
		let laddermsg=[]
		for(var i = 0; i < jt.length; i++){
			// console.log(nownum)
			// console.log(that.data)
			// console.log(that.data.goods[idx].pricelist)
			let lownum=jt[i].lower_num
			let upnum=jt[i].upper_num
			// console.log(jtpri[i])
			
			let bpri=jtpri[i].price
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
			}else if(ygnum<lownum){   //后续阶梯（最小值大于已购）
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
		Totalpri=Totalpri.toFixed(2).toString()
		let laddermsgs={
			'laddermsg':laddermsg,
			'Totalpri':Totalpri
		}
		// console.log(laddermsgs)
		return laddermsgs
	},
	//阶梯价改变
	ladderpri_gb(){
		// console.log('ladderpri_gb0')
		let that = this
		let jtgsele=that.data.goods_sele
		for(var idx=0;idx<jtgsele.length;idx++){
			// console.log('ladderpri_gb1')
			// console.log(jtgsele[idx].laddermsgs)
			if(!jtgsele[idx].laddermsgs){
				continue   //售罄
			}
			// console.log('ladderpri_gb')
			let ygnum0=that.data.goodslist[idx].havenum  //已购
			let newadd=0
			for(var i=0;i<idx;i++){
				if(jtgsele[i].goods_sku_id==jtgsele[idx].goods_sku_id){
					
					if(jtgsele[i].xuan){
						newadd += jtgsele[i].num
						// console.log('----------------------------'+newadd)
					}
				}
				
			}
			// console.log(newadd)
			let ygnum=ygnum0+newadd
			let jt=that.data.goodslist[idx].limitlist  //规则
			var jtpri=that.data.goodslist[idx].pricelist  //规则价格
			let nownum=jtgsele[idx].num//本次购买数量
			
			// let numz=ygnum+nownum
			// console.log(jtpri)
			let nownum1 //定义临时变量
			let numlen //定义单个阶梯的限购数量
			let jtlist=[]        //阶梯列表
			let jtnum=[]         //阶梯数量
			let jtTotal=[]         //阶梯总价
			let numladd=[]      //阶梯的区间
			let priladd=[]      //阶梯的价格
			let Totalpri=0
			let laddermsg=[]
			for(var i = 0; i < jt.length; i++){
				console.log(nownum)
				// console.log(that.data)
				// console.log(that.data.goods[idx].pricelist)
				let lownum=jt[i].lower_num
				let upnum=jt[i].upper_num
				// console.log(jtpri[i])
				
				let bpri=jtpri[i].price
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
				}else	if(ygnum<lownum){   //后续阶梯（最小值大于已购）
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
			Totalpri=Totalpri.toFixed(2).toString()
			let laddermsgs={
				'laddermsg':laddermsg,
				'Totalpri':Totalpri
			}
			// console.log(laddermsgs)
			that.data.goods_sele[idx].laddermsgs=laddermsgs
			// return laddermsgs
		}
		// console.log('------------------------------xiugai')
		that.setData({
			goods_sele:that.data.goods_sele
		})
	},
	
	onRetry(){
		this.onLoad()
	}
})
