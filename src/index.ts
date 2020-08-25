import { Func, Inject, Provide } from '@midwayjs/decorator';
import { FaaSContext } from '@midwayjs/faas';
import { BaiduOcr } from './baiduOcr';

@Provide()
export class IndexService  {

  @Inject()
  ctx: FaaSContext;  // context
    
  // @Inject()
  // ocr : BaiduOcr;
  
  @Func('index.test')
  async test() {
    return 'hello world';
  }
  

  @Func('index.accurate')
  async accurate() {
    try {
      const body = this.ctx.req.body
      let image = '';
      if(body && body.image){
        image = body.image
      }
      let ocr = new BaiduOcr()
      if (!ocr.isExpired()){
        await ocr.getToken()
      }
      let ocrCtx =  await ocr.ocrTrans(image)
      let imageText = null
      if(ocrCtx && ocrCtx.words_result){
        imageText = ocr.transResult(ocrCtx.words_result)
        ocrCtx.words_result = imageText
      }
      this.ctx.body = ocrCtx
    } catch (error) {
      this.ctx.logger.error(error)
      return 
    }
  }

}
