//logs.js
const app = getApp()

Page({
  data: {
		goods:[
			{type:1,pri:"56.90",num:1},
			{type:2,pri:"56.90",num:2},
			{type:1,pri:'0.10',num:4},
			{type:1,pri:'0.01',num:3},
		],
		spimg:[],
		goods_sele:[],
		all:false,
		sum:'0.00'
  },
  onLoad: function () {
   
  },
	onShow(){
		this.getcar()
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
		if(this.data.goods_sele[sid].xuan==false){
			this.data.goods_sele[sid].xuan=true
				that.setData({
					goods_sele:this.data.goods_sele
				});
		}else{
			this.data.goods_sele[sid].xuan=false
				that.setData({
					goods_sele:this.data.goods_sele
				});
		}
	  let qx=true
	  for (let i in this.data.goods_sele) {
	  	if(this.data.goods_sele[i].xuan==false){
	  		qx=false
	  		break
	  	}
	  }
		console.log(qx)
		//触发全选
	  if(qx==true){
	  	this.setData({
	  		all:true
	  	})
	  }else{
			this.setData({
				all:false
			})
		}
		//计算总价
		this.countpri()
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
		//计算总价
		this.countpri()
	},
	/*计算价格*/
	countpri(){
		let heji=0
		let var2= this.data.goods_sele
		for (let i in var2) {
			if(var2[i].xuan==true){
				heji +=var2[i].num*(var2[i].pri*100)
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
			console.log(heji)
		}
		
		let hj1 = heji.substring(0, heji.length-3);
		let hj2 = heji.substring( heji.length-3, heji.length-1);
		console.log(hj1+'.'+hj2)
		heji=hj1+'.'+hj2
		this.setData({
			sum:heji
		})
	},
	//阶梯价
	ladderpri(idx){
		let that = this
		let ygnum=that.data.goods[idx].havenum  //已购
		let jt=that.data.goods[idx].pricelist  //规则
		let nownum=that.data.goods[idx].order_cart.goods_count//本次购买数量
		// let numz=ygnum+nownum
		let nownum1=nownum //定义临时变量
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
			console.log(lownum)
			console.log(upnum)
			
			let jtzsy=jt[i].limit_num-jt[i].saled_num
			if((lownum-1<=ygnum&&ygnum<upnum) || ygnum<lownum){ //根据已购获取开始阶梯
				// console.log('lownum:'+lownum)           
				// console.log('ygnum:'+ygnum)           
				// console.log('upnum:'+upnum)           
				let item1
				item1=upnum-ygnum        //n1阶梯限售剩余
				
				if(jtzsy<item1){
					item1=jtzsy
				}
				if(item1==0){
					continue
				}
				jtlist.push(i)						//阶梯idx
				
				priladd.push(bpri)
				if(nownum1<=item1){         //限售剩余足够
					// jtnum.push(nownum)
					// numladd.push()
					// jtTotal.push(100*bpri*nownum/100)
					Totalpri +=100*bpri*nownum1/100
					let ladderOne={
						'numladd':lownum+'-'+upnum,
						'jtnum':nownum1,
						'priladd':bpri,
						'jtTotal':100*bpri*nownum1/100
					}
					ladderOne=JSON.stringify(ladderOne)
					laddermsg.push(ladderOne)
					break;   //结束
				}else{                   //限售剩余不足
					nownum1=nownum1-item1
					// jtnum.push(item1)
					// jtTotal.push(100*bpri*item1/100)
					// Totalpri +=100*bpri*item1/100
					let ladderOne={
						'numladd':lownum+'-'+upnum,
						'jtnum':item1,
						'priladd':bpri,
						'jtTotal':100*bpri*item1/100
					}
					ladderOne=JSON.stringify(ladderOne)
					laddermsg.push(ladderOne)
				}
			}
			/*if(ygnum<lownum){   //后续阶梯（最小值大于已购）
				console.log('for1:'+i)
				jtlist.push(i)    //阶梯idx
				numlen=upnum-lownum   //当前阶梯的限购数量
				if(nownum1<=numlen){  //限售剩余足够
					jtnum.push(nownum1)
					let sss=100*bpri*nownum1
					jtTotal.push()
					break;   //结束
				}else{                   //限售剩余不足
					nownum1=nownum1-numlen
					jtnum.push(numlen)
					jtTotal.push(numlen*bpri)
				}
			}*/
		}
		// console.log(jtlist)
		// console.log(numladd)
		// console.log(jtnum)
		// console.log(jtTotal)
		// console.log(priladd)
		// let aaa={
		// 	// 'jtlist':jtlist,
		// 	'numladd':numladd,
		// 	'jtnum':jtnum,
		// 	'jtTotal':jtTotal,
		// 	'priladd':priladd,
		// 	'Totalpri':Totalpri
		// }
		// aaa=JSON.stringify(aaa)
		console.log(laddermsg)
		console.log(Totalpri)
		return laddermsg
	},
	openOrder(){
		app.openOrder()
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
					// that.getcar()
					//计算总价
					that.countpri()
				}
			}
		})
	},
	//获取购物车
	getcar(){
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
					for (let i=0;i<that.data.goods.length;i++) {
						arra.push({
							xuan:false,
							pri:that.data.goods[i].order_cart.internal_price,
							num:that.data.goods[i].order_cart.goods_count,
							order_cart_id:that.data.goods[i].order_cart.order_cart_id
						})
						if(that.data.goods[i].order_cart.is_ladder_pricing==1){
							that.ladderpri(i)
						}
					}
					that.setData({
						goods_sele:arra
					})
				}
			}
		})
	}
})



//http://water5100.800123456.top/WebService.asmx/order?op=orderpub&key=server_mima&tokenstr=1357311016561513&goods_sku_id=1&logistics_self=0&shop_store_house_id=5&shop_delivery_time_id=9&num=1&goods_unit=330ml*24瓶