/*
** File: safecode.js
** Usage: a method to create safecode.Use 0-9a-zA-Z.
** About: 
**		support@mae.im
*/

function $safecode(sessionKey,opt){
	var cfg = {
		length : 4,
		odd : 0,
		padding : 0,
		data : "",
		size:10,
		bit : 24,
		font:"songti",
		bgColor:0xffffff
	};
	F.extend(cfg,opt||{});
	function getrndcolor(){
		return (F.random(0,128) <<16 ) + (F.random(64,128)<<8) + F.random(0,128);
	}
	Response.Buffer = true;
	Response.Expires = -1;
	Response.AddHeader("Pragma", "no-cache");
	Response.AddHeader("cache-ctrol", "no-cache");
	Response.ContentType = "Image/bmp";
	var I, ii, iii,bgColor=cfg.bgColor,vNumberData=[],vCode=[], vCodes="";
	var fontdata = IO.file.readAllText(__DIR__ + "\\exts\\" + cfg.font + ".font");
	var cCode = (new Function("Font",fontdata))(vNumberData) || "0123456789aAcCeEmMnNrRsSuUvVwWxXzZjJbBdDfFhHkKtTgGpPqQyY＋－×÷＝+-/= .";
	cfg.size = Math.sqrt(vNumberData[0].length);
	if(cfg.data==""){
		for(var i=0;i<=cfg.length-1;i++){
			vCode.push(F.random(0,55));
			vCodes += cCode.substr(vCode[vCode.length-1],1);
		}
	}else{
		for(var i=0;i<=cfg.data.length-1;i++){
			var index = cCode.indexOf(cfg.data.substr(i,1));
			if(index>=0){
				vCode.push(index);
				vCodes+=cfg.data.substr(i,1);
			}
		}
		cfg.length = vCode.length;
	}
	F.session(sessionKey,vCodes);
	var padding = cfg.padding,
		image = bmpImage(cfg.length * cfg.size + padding*2,cfg.size + padding*2,cfg.bit),
		header = byteArrayOutputStream(),
		body = byteArrayOutputStream(),
		padzero = image.writeHeader(header),
		bytepad=[];
	if(padzero>0){
		for(var i=0;i<padzero;i++) bytepad.push(0);
	}
	function WriteRndColor(oldColor){
		if(F.random(1,100) <= cfg.odd){
			body.writeRGB(getrndcolor());
		}else{
			body.writeRGB(oldColor);
		}
	}
	for(var i=(cfg.size-1)+padding*2;i>=0;i--){
		for(var ii=0;ii<=cfg.length-1;ii++){
			if(ii==0){
				for(var m=0;m<padding;m++) WriteRndColor(bgColor);
			}
			for(var iii=0;iii<cfg.size;iii++){
				var num;
				if(i>=padding && i<cfg.size+padding){
					num = vNumberData[vCode[ii]][(i-padding) * cfg.size + iii];
					if(num==-1){
						WriteRndColor(0);
					}else if(num==0){
						WriteRndColor(bgColor);
					}else{
						WriteRndColor(0xffffff - num);
					}
				}else{
					WriteRndColor(bgColor);
				}
			}
			if(ii==cfg.length-1){
				for(var m=0;m<padding;m++) WriteRndColor(bgColor);
			}
		}
		body.writeBytes(bytepad);
	}
	delete WriteRndColor;
	F.echo(F.base64.toBinary(F.base64.e(header.toByteArray())),F.TEXT.BIN);
	F.echo(F.base64.toBinary(F.base64.e(body.toByteArray())),F.TEXT.BIN);
}
//=====================================================================
// GIF Support etc.
//
//---------------------------------------------------------------------
// byteArrayOutputStream
//---------------------------------------------------------------------
var byteArrayOutputStream = function() {
	var _bytes = new Array();
	var _this = {};
	_this.writeByte = function(b) {
		_bytes.push(b & 0xff);
	};
	_this.writeShort = function(i) {
		_this.writeByte(i);
		_this.writeByte(i >>> 8);
	};
	_this.writeLong = function(i) {
		_this.writeByte(i);
		_this.writeByte(i >>> 8);
		_this.writeByte(i >>> 16);
		_this.writeByte(i >>> 24);
	};
	_this.writeRGB = function(i) {
		_this.writeByte(i);
		_this.writeByte(i >>> 8);
		_this.writeByte(i >>> 16);
	};
	_this.writeBytes = function(b, off, len) {
		off = off || 0;
		len = len || b.length;
		for (var i = 0; i < len; i += 1) {
			_this.writeByte(b[i + off]);
		}
	};
	_this.writeString = function(s) {
		for (var i = 0; i < s.length; i += 1) {
			_this.writeByte(s.charCodeAt(i) );
		}
	};
	_this.toByteArray = function() {
		return _bytes;
	};
	return _this;
};
//---------------------------------------------------------------------
// bmpImage (B/W)
//---------------------------------------------------------------------
var bmpImage = function(width,height,bit){
	bit = bit || 24;
	var _bit = bit;
	var _bitn = _bit/8;
	var _width = width;
	var _height = height;
	var _data = new Array(width * height);
	var _this = {};
	_this.setPixel = function(x, y, pixel) {
		_data[y * _width + x] = pixel;
	};
	_this.writeHeader = function(out) {
		out.writeString("BM");
		var pixWidth = ((((_width * bit) + 31) & ~31) / 8);
		var biSizeImage = pixWidth * _height;
		out.writeLong(biSizeImage+54);
		out.writeBytes([0,0,0,0,54,0,0,0,40,0,0,0]);
		out.writeLong(_width);
		out.writeLong(_height);
		out.writeBytes([1,0,_bit,0,0,0,0,0]);
		out.writeLong(biSizeImage);
		out.writeBytes([18,11,0,0,18,11,0,0,0,0,0,0,0,0,0,0]);
		return pixWidth - _width *_bitn;
	};
	_this.write = function(out) {
		var pixCount = _this.writeHeader(out);
		var byt=[];
		for(var i=0; i< pixCount; i++) byt.push(0);
		for(var i=_height-1;i>=0;i--){
			for(var j=0;j<_width;j++){
				if(_bitn==3)out.writeRGB(_data[i*_width+j]);
				else out.writeLong(_data[i*_width+j]);
			}
			out.writeBytes(byt);
		}
	};
	return _this;
}
exports.safecode = $safecode;