//car.js
var pageState = require('../../utils/pageState/index.js')
const app = getApp()

Page({
  data: {
		goods:[],
		spimg:[],
		goods_sele:[],
		all:false,
		sum:'0.00'
  },
  onLoad: function () {
   
  },
	onShow(){
		var that=this
		that.getcar()
			

	},
	onReady(){
		
		// console.log(this.data.goods.length)
		
		
		// console.log(this.data.goods_sele)
	},
	onfocus(){
		return false;
	},
	select(e){
		let that =this
		// console.log(e.currentTarget.dataset.selec)
		let sid=e.currentTarget.dataset.selec
		// console.log(this.data.goods_sele[sid].xuan)
		if(that.data.goods_sele[sid].xuan==false){
			that.data.goods_sele[sid].xuan=true
				that.setData({
					goods_sele:that.data.goods_sele
				});
		}else{
			that.data.goods_sele[sid].xuan=false
				that.setData({
					goods_sele:that.data.goods_sele
				});
		}
	  let qx=true
	  for (let i in that.data.goods_sele) {
	  	if(that.data.goods_sele[i].xuan==false){
	  		qx=false
	  		break
	  	}
	  }
		console.log(qx)
		//触发全选
	  if(qx==true){
	  	that.setData({
	  		all:true
	  	})
	  }else{
			that.setData({
				all:false
			})
		}
		that.ladderpri_gb()
		//计算总价
		that.countpri()
	},
	onChange(e){
		console.log(e.currentTarget.dataset.selec)
		let idx =e.currentTarget.dataset.selec
		console.log(e.detail)
		this.data.goods_sele[idx].num=e.detail
			this.setData({
				goods_sele:this.data.goods_sele
			});
		//计算总价
		this.countpri()
		// console.log(that.goods_sele[1].laddermsgs.Totalpri)
	},
	selecAll(){
		let kg
		if(this.data.all==false){
			kg=true
		}else{
			kg=false
		}
		this.setData({
			all:kg
		})
		// this.data.goods_sele[sid].xuan=true
		for (let i in this.data.goods_sele) {
			this.data.goods_sele[i].xuan=kg
		}
		this.setData({
			goods_sele:this.data.goods_sele
		});
		this.ladderpri_gb()
		//计算总价
		this.countpri()
	},
	/*计算价格*/
	countpri(){
		let heji=0
		let var2= this.data.goods_sele
		for (let i in var2) {
			if(var2[i].xuan==true){
				
				if(var2[i].laddermsgs){
					
						heji +=var2[i].laddermsgs.Totalpri*100

				}else{
					heji +=var2[i].num*(var2[i].pri*100)
				}
			}
		}
		
		heji=(heji/100).toFixed(2)

		this.setData({
			sum:heji
		})
	},
	//阶梯价初始化
	ladderpri(idx,num){
		// for(var i=0;i<idx;i++){
		// 	
		// }
		let that = this
		let ygnum=that.data.goods[idx].havenum  //已购
		let jt=that.data.goods[idx].limitlist  //规则
		var jtpri=that.data.goods[idx].pricelist  //规则价格
		let nownum=that.data.goods[idx].order_cart.goods_count//本次购买数量
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
			let lownum=jt[i].lower_num
			let upnum=jt[i].upper_num
			// console.log(jtpri[i])
			
			let bpri=jtpri[i].price
			
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
			let ygnum0=that.data.goods[idx].havenum  //已购
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
			let jt=that.data.goods[idx].limitlist  //规则
			var jtpri=that.data.goods[idx].pricelist  //规则价格
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
	openOrder(){
		let that = this
		let xuanG=that.data.goods_sele
		let idG=''
		for(let i in xuanG){
			if(xuanG[i].xuan){
				if(idG==''){
					idG =xuanG[i].order_cart_id
				}else{
					idG +=','+xuanG[i].order_cart_id
				}
				
			}
			
			// console.log(idG)
		}
		
		console.log(idG)
		if(idG!==''){
			app.openOrder(idG,1)
		}
	},
	//加减
	onNum(e){
		let that = this
		console.log(e.currentTarget.dataset)
		let ad=e.currentTarget.dataset.ad
		let id=e.currentTarget.dataset.id
		let thisidx=e.currentTarget.dataset.idx
		
		if(that.data.goods_sele[thisidx].num<2&&ad=='-'){
				console.log('禁止')
				return false;

		}
		//http://water5100.800123456.top/WebService.asmx/shopcar
		
		// return
		wx.request({
			url:  app.IPurl1+'shopcar',
			data:{
				op:'num',
				ad:ad,
				order_cart_id:id,
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
					let resultd=res.data
					console.log(res)
					console.log(resultd)
					if(ad=='-'){
						that.data.goods_sele[thisidx].num--
					}else{
						that.data.goods_sele[thisidx].num++
					}
					
					that.setData({
						goods_sele:that.data.goods_sele
					})
					console.log(thisidx)
					// let newladd=that.ladderpri(thisidx,that.data.goods_sele[thisidx].num)
					// console.log(newladd)
					// that.data.goods_sele[thisidx].laddermsgs=newladd
					// that.setData({
					// 	goods_sele:that.data.goods_sele
					// })
					that.ladderpri_gb()
					// that.getcar()
					//计算总价
					that.countpri()
				}
			}
		})
	},
	//获取购物车
	getcar(){
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
					console.log(resultd)
					that.setData({
						goods:resultd
					})
					// let imgb=[]
					// for(let i = 0;i<resultd.length;i++){
					// 	// console.log(rlist[i].goods_img)
					// 	let rlb=resultd[i].order_cart.goods_img.split(",")
					// 	imgb.push(rlb[0])
					// }
					// that.data.spimg = that.data.spimg.concat(imgb)
					// that.setData({
					// 	spimg:that.data.spimg
					// })
					//设置选中的数组
					let arra=[]
					for (let i=0;i<resultd.length;i++) {
						
						if(resultd[i].order_cart.is_ladder_pricing==1){
							
							arra.push({
								xuan:false,
								pri:resultd[i].order_cart.internal_price,
								num:resultd[i].order_cart.goods_count,
								order_cart_id:resultd[i].order_cart.order_cart_id,
								goods_sku_id:resultd[i].order_cart.goods_sku_id,
								laddermsgs:that.ladderpri(i)
							})
						}else{
							arra.push({
								xuan:false,
								pri:resultd[i].order_cart.internal_price,
								num:resultd[i].order_cart.goods_count,
								order_cart_id:resultd[i].order_cart.order_cart_id,
								goods_sku_id:resultd[i].order_cart.goods_sku_id
							})
						}
					}
					that.setData({
						goods_sele:arra,
						all:false,
						sum:'0.00'
					})
					that.countpri()
				}
				that.selecAll()
				pageState1.finish()    // 切换为finish状态
			},
			fail() {
				 pageState1.error()    // 切换为error状态
			}
		})
	},
	onRetry(){
		this.getcar()
	},
	opengoodsxq(e){
		let id=e.currentTarget.dataset.gid
		app.opengoods(id)
	}
})



//http://water5100.800123456.top/WebService.asmx/order?op=orderpub&key=server_mima&tokenstr=1357311016561513&goods_sku_id=1&logistics_self=0&shop_store_house_id=5&shop_delivery_time_id=9&num=1&goods_unit=330ml*24瓶