//logs.js
const app = getApp()

Page({
  data: {
    userInfo: app.globalData.userInfo
  },
  onLoad: function () {
		this.setData({
			userInfo:app.globalData.userInfo
		})

  },
	pveimg(e){
		let that =this
		
			app.pveimg(e.currentTarget.dataset.imgurl)

		
	}
})
