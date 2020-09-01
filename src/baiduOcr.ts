import { default as Request, Method } from 'axios'
import { Provide } from '@midwayjs/decorator';
import * as qs from 'querystring'
const DEFAULT_FETCH_AHEAD_DURATION = 24 * 60 * 60 * 1000

@Provide()
export class BaiduOcr {
	private config
	private authCache
	private authDate
	constructor() {
		this.config = {
			"host": "https://aip.baidubce.com",
			"client_secret": "",
			"grant_type": "client_credentials",
			"client_id": ""
		}
		this.authCache = {
			access_token: '',
			expires_in: null,
			lastTokenTime: null
		}
		this.authDate = new Date()
	}
	// 判断token时效
	isExpired() {

		// let now = new Date()
		// 根据服务器返回的access_token过期时间，提前重新获取token
		if (this.authCache.expires_in && this.authCache.lastTokenTime && (this.authCache.lastTokenTime -
			this.authDate.getTime() > this.authCache.expires_in -
			DEFAULT_FETCH_AHEAD_DURATION)) {
			return true
		}
		return false

	}
	// 获取百度token
	async getToken() {
		const param = qs.stringify({
			'grant_type': this.config.grant_type,
			'client_id': this.config.client_id,
			'client_secret': this.config.client_secret
		})
		let options = {
			url: `${this.config.host}/oauth/2.0/token?${param}`,
			method: <Method>'GET',
		}
		let token = await Request(options)
		if (token && token.data && token.data.access_token) {
			let now = new Date()
			this.authCache.access_token = token.data.access_token
			this.authCache.expires_in = token.data.expires_in * 1000
			this.authCache.lastTokenTime = now.setMilliseconds(now.getMilliseconds() + this.authCache.expires_in)
			return token
		}
	}
	// 调用百度ocr接口
	async ocrTrans(image: any) {
		image = encodeURI(image.split(',')[1])
		const body = qs.stringify({
			'image': image,
			'paragraph': 'true'
		})
		const param = qs.stringify({
			'access_token': this.authCache.access_token
		})
		let options = {
			url: `${this.config.host}/rest/2.0/ocr/v1/accurate_basic?${param}`,
			method: <Method>'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			data: body
		}
		let ocrResult = await Request(options)
		if (ocrResult && ocrResult.data) {
			console.log(ocrResult)
			return ocrResult.data
		}else{
			 throw new Error('ocr调用失败')
		}
	}
	// 拼接翻译结果
	transResult(src: any) {
		let dest = []
		for (let i in src) {
			dest.push(src[i].words)
		}
		return dest
	}

}
