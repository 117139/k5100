//logs.js
var pageState = require('../../utils/pageState/index.js')
const app = getApp()
const QRCode = require('../../utils/weapp-qrcode.js')
import rpx2px from '../../utils/rpx2px.js'
let qrcode;
const qrcodeWidth = rpx2px(210)
Page({
  data: {
		order_info_id:'',
		order_status:'',
		delivery_code:'',
		goods:[],
		spimg:[],
		shopNum:[],
		goods_sele:[],
    qujan:[],
		columns:['仓库自提','普通配送'],
		columns1:['仓库1','仓库2','仓库3','仓库4'],
		columns2:['时间1','时间2','时间3','时间4'],
		show0:0,
		show1:0,
		show2:0,
		sum:0,
		qrcodeWidth: qrcodeWidth,
  },
  onLoad: function (option) {
    if(option.id){
			console.log(option.id)
		}
		this.setData({
			order_info_id:option.id
		})
		this.getOrderList(option.id)
  },
	onReady(){
		let that =this
		that.countpri()
		console.log(that.delivery_code)
		
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
	/*计算价格*/
	countpri(){
		/*let heji=0
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
					console.log(zj)
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
		})*/
	},
	confirmBtn(){
		console.log('确认收货')
		/*wx.request({
			url: address + 'wxPay',
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
	},
	//获取订单详情
	getOrderList(id){
		const pageState1 = pageState.default(this)
		pageState1.loading()    // 切换为loading状态
		let that = this
		//http://water5100.800123456.top/WebService.asmx/order
		wx.request({
			url:  app.IPurl1+'order',
			data:{
				op:'info',
				order_info_id:id,
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
						console.log(res.data)
						console.log(resultd.info.delivery_code)
						that.ewm(resultd.info.delivery_code)
						let	sum1=resultd.info.order_price.toFixed(2)
						console.log(sum1)
						that.setData({
							goods:resultd,
							order_status:resultd.info.order_status,
							delivery_code:resultd.info.delivery_code,
							sum:sum1
						})
						let imgb=[]
						console.log(resultd.list)
						for(let i in resultd.list){
							let rlb=resultd.list[i].order_product.goods_img.split(",")
							imgb.push(rlb[0])
						}
						that.data.spimg = that.data.spimg.concat(imgb)
						that.setData({
							spimg:that.data.spimg
						})
						//设置订单的阶梯数据
						let arra=[]
						for (let i=0;i<that.data.goods.list.length;i++) {
							let plist=that.data.goods.list[i]
							if(plist.order_product.is_ladder_pricing==1){
								
								arra.push({
									pri:plist.order_product.internal_price,
									num:plist.order_product.goods_count,
									// order_cart_id:that.data.goods.list[i].order_product.order_cart_id,
									laddermsgs:that.ladderpri(i)
								})
							}else{
								
								let ss=plist.order_product.internal_price * plist.order_product.goods_count
								
								let Totalpri=Math.round((ss*1000)/1000)
								
								arra.push({
									pri:plist.order_product.internal_price,
									num:plist.order_product.goods_count,
									Totalpri:Totalpri,
									// order_cart_id:plist.order_product.order_cart_id
								})
							}
						}
						that.setData({
							goods_sele:arra
						})
						/*that.countpri()*/
				}
				pageState1.finish()    // 切换为finish状态
			},
			fail() {
				 pageState1.error()    // 切换为error状态
			}
		})
	},
	//阶梯价
	ladderpri(idx,num){
		
		let that = this
		let ygnum=that.data.goods.list[idx].havenum  //已购
		// let ygnum=0  //已购
		let jt=that.data.goods.list[idx].pricelist  //规则
		let nownum=that.data.goods.list[idx].order_product.goods_count//本次购买数量
		
		
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
			
			let jtzsy=jt[i].limit_num-jt[i].saled_num //阶梯限购的剩余
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
					// Totalpri +=100*bpri*nownum/100
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
					// Totalpri +=100*bpri*item1/100
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
					// Totalpri +=100*bpri*nownum1/100
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
					// Totalpri +=100*bpri*numlen/100
					laddermsg.push(ladderOne)
				}
			}
		}
	
		let laddermsgs={
			'laddermsg':laddermsg,
			'Totalpri':Totalpri
		}
		console.log(laddermsgs)
		return laddermsgs
	},
	opengoods(e){
		 let id = e.currentTarget.dataset.id
		app.opengoods(id)
	},
	
	ewm(code){
		qrcode = new QRCode('canvas', {
			usingIn: this, // usingIn 如果放到组件里使用需要加这个参数
			text: code,
			// image: '/images/bg.jpg',
			width: qrcodeWidth,
			height: qrcodeWidth,
			colorDark: "#000",
			colorLight: "white",
			correctLevel: QRCode.CorrectLevel.H,
		});
	},
	pay(){
		app.Pay(this.data.goods.info.order_info_id,'info')
	},
	onRetry(){
		this.onLoad()
	}
})
