/*
** File: safecode/index.js
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
		bgColor:0xffffff,
		wave:false
	};
	F.extend(cfg,opt||{});
	Response.Buffer = true;
	Response.Expires = -1;
	Response.AddHeader("Pragma", "no-cache");
	Response.AddHeader("cache-ctrol", "no-cache");
	Response.ContentType = "Image/bmp";
	var I, ii, iii,
		bgColor=cfg.bgColor,
		vNumberData=[],
		vCode=[], 
		vCodes="",
		fontdata = IO.file.readAllText(__dirname + "\\fonts\\" + cfg.font + ".font"),
		cCode = (new Function("Font",fontdata))(vNumberData) || "0123456789aAcCeEmMnNrRsSuUvVwWxXzZjJbBdDfFhHkKtTgGpPqQyY＋－×÷＝+-/= .", index, achar;
	cfg.size = Math.sqrt(vNumberData[0].length);
	if(cfg.data==""){
		for(var i=0;i<=cfg.length-1;i++){
			index = F.random(0,55);
			vCode.push(AChar(vNumberData[index]));
			vCodes += cCode.substr(index,1);
		}
	}else{
		for(var i=0;i<=cfg.data.length-1;i++){
			achar = cfg.data.substr(i,1);
			index = cCode.indexOf(achar);
			if(index>=0){
				vCode.push(AChar(vNumberData[index]));
				vCodes+=achar;
			}
		}
		cfg.length = vCode.length;
	}
	F.session(sessionKey,vCodes);
	var padding = cfg.padding,
		width=0,
		height=0,
		image = null,
		size = cfg.size;

	for(var i=0;i<vCode.length;i++){
		width += vCode[i].width;
		height = Math.max(height, vCode[i].height);
	}
	image = bmpImage(width + padding*2,height + padding*2,cfg.bit)
	image.setBgColor(0xffffff, cfg.odd);
	var s2 = size / 2, s4 = size/4, drawed=0, x=0,y=0;
	for(var i=0;i<vCode.length;i++){
		achar = vCode[i];
		x = drawed + padding + Math.floor(Math.random() * s2 - s4);
		y = padding + Math.floor(Math.random() * s2 - s4);
		image.drawChar2(x, y, achar.data, achar.width, achar.height);
		drawed+=achar.width;
	}
	F.echo(IO.buffer2binary(image.getHeaderBuffer()),F.TEXT.BIN);
	F.echo(IO.buffer2binary(image.getBodyBuffer()),F.TEXT.BIN);
	return vCodes;
}
//=====================================================================
// GIF Support etc.
//
//---------------------------------------------------------------------
// byteArrayOutputStream
//---------------------------------------------------------------------
var AChar = function(data){
	var _char={};
	_char.data = data.slice(0);
	_char.height = _char.data.pop();
	_char.width = _char.data.pop();
	return _char;
};
var byteArrayOutputStream = function() {
	var _bytes = new Array();
	var _this = {};
	_this.writeByte = function(b) {
		_bytes.push(b & 0xff);
	};
	_this.skip = function(n) {
		_bytes.length += (n || 1);
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
	var _bit = bit,
		_bitn = _bit/8,
		_width = width,
		_height = height,
		_data = new Array(width * height),
		_pixWidth = 0,
		_this = {},
		_header = byteArrayOutputStream();
		
	_this.drawPixel = function(x, y, pixel) {
		var q = (height-y-1) * _pixWidth + x * 3;
		_data[q] = pixel & 0xff;
		_data[q + 1] = (pixel >>>8) & 0xff;
		_data[q + 2] = (pixel >>>16) & 0xff;
		if(_bitn==4) _data[q + 3] = (pixel >>>24) & 0xff;
	};
	_this.drawPixel2 = function(x, y, r,g,b, a) {
		var q = (height-y-1) * _pixWidth + x * 3;
		_data[q] = b;
		_data[q + 1] = g;
		_data[q + 2] = r;
		if(_bitn==4) _data[q + 3] = a;
	};
	_this.drawChar = function(x, y, data) {
		var w = Math.sqrt(data.length), num = 0;
		for(var i =0;i<w;i++){
			for(var j=0;j<w;j++){
				((num = data[j * w + i]) != -1) && _this.drawPixel(x+i, y+j, num);
			}
		}
	};
	_this.drawChar2 = function(x, y, data, w, h) {
		var num = 0;
		for(var j=0;j<h;j++){
			for(var i =0;i<w;i++){
				((num = data[ j * w + i]) != -1) && _this.drawPixel(x+i, y+j, num);
			}
		}
	};
	_this.writeHeader = function() {
		_header.writeString("BM");
		_pixWidth = ((((_width * bit) + 31) & ~31) / 8);
		var biSizeImage = _pixWidth * _height;
		_header.writeLong(biSizeImage+54);
		_header.writeBytes([0,0,0,0,54,0,0,0,40,0,0,0]);
		_header.writeLong(_width);
		_header.writeLong(_height);
		_header.writeBytes([1,0,_bit,0,0,0,0,0]);
		_header.writeLong(biSizeImage);
		_header.writeBytes([18,11,0,0,18,11,0,0,0,0,0,0,0,0,0,0]);
		_data.length = biSizeImage;
		return _pixWidth - _width *_bitn;
	};
	_this.setBgColor = function(color, nosie){
		var r = (color >>>16) & 0xff,g = (color >>>8) & 0xff,b = color & 0xff,a = (color >>>24) & 0xff, nosie = nosie || 0;
		for(var i=0;i<_width;i++){
			for(var j=0;j<_height;j++){
				if(Math.random() * 100 < nosie){
					_this.drawPixel2(i, j, Math.floor(Math.random() * 128), Math.floor(Math.random() * 128), Math.floor(Math.random() * 128), a);
				}else{
					_this.drawPixel2(i, j, r, g, b, a);
				}
			}
		}
	};
	_this.getHeaderBuffer = function(){
		return _header.toByteArray();
	};
	_this.getPadding = function(){
		return _pixWidth - _width *_bitn;
	};
	_this.getBodyBuffer = function(){
		return _data;
	};
	_this.writeHeader();
	return _this;
}
exports.Safecode = $safecode;
exports.BmpImage = bmpImage;