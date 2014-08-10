/*
u16 GBKtoUNICODE(u16 GBKCode)
{
u16 unicode;
u8 buff[2];
u16 *p;
u8 ch,cl;


ch = GBKCode >> 8;
cl = GBKCode & 0x00ff;


//计算偏移
if(cl < 0x7f)
unicode = (ch-0x81)*190+cl-0x40;
if(cl > 0x80)
unicode = (ch-0x81)*190+cl-0x41;
unicode *= 2;


W25X16_Read(buff,CODE_GtoU_BASE + unicode,2) ; //读取码表


p = (u16 *)buff;
return *p;
}
*/
F.exports.encoding=F.exports.encoding||{};
F.exports.encoding.unicode = F.exports.encoding.unicode || (function(){
	var CP = {filepath:__DIR__ +"\\exts\\UtoG.sys",stream:null};
	var inited=false;
	var u2g=function(u){
		var offset,ret=[];
		if(u<=0X9FA5)offset=u-0x4E00;
		else if(u>0x9FA5)
		{
			if(u<0xFF01||u>0xFF61)return 0;
			offset=u-0xFF01+0x9FA6-0x4E00;    
		}  
		CP.stream.position=offset*2;
		ret.push(F.vbs.ascb(CP.stream.read(1)));
		ret.push(F.vbs.ascb(CP.stream.read(1)));
		return ret ;
	};
	return {
		toGBK:function(u){
			if(u.length<=0)return [];
			if(!F.exists(CP.filepath)){
				ExceptionManager.put(new Exception(0xb0a1,"F.exports.encoding.unicode.toGBK","codepage file is not exists."));
				return [];
			}
			CP.stream = F.stream(3,1);
			CP.stream.open();
			CP.stream.LoadFromFile(CP.filepath);
			var i=0,c,ret=[];
			while(i<u.length){
				c = u.charCodeAt(i);
				if(c<=0x80) ret.push(c);
				else ret = ret.concat(u2g(c)); 
				i++;
			}
			CP.stream.close();
			return ret;
		}
	};
})();