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
		bit : 24,
		font:"songti",
		bgColor:0xffffff,
		wave : true,
		width:0,
		height:0
	};
	F.extend(cfg,opt||{});
	Response.Buffer = false;
	Response.Expires = -1;
	Response.AddHeader("Pragma", "no-cache");
	Response.AddHeader("cache-ctrol", "no-cache");
	Response.ContentType = "Image/bmp";
	var 
		bgColor=cfg.bgColor,
		vNumberData=[],
		vCode=[], 
		vCodes="",
		fontdata = IO.file.readAllText(__dirname + "\\fonts\\" + cfg.font + ".font"),
		cCode = (new Function("Font",fontdata))(vNumberData) || "0123456789aAcCeEmMnNrRsSuUvVwWxXzZjJbBdDfFhHkKtTgGpPqQyY ＋－×÷＝+-/=.", index, achar,
		wordcount = cCode.indexOf(" ");
		
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
		width=cfg.width,
		height=cfg.height,
		image = null;
	if(width==0){
		for(var i=0;i<vCode.length;i++){
			width += vCode[i].width;
			height = Math.max(height, vCode[i].height);
		}
		width += padding *2;
		height += padding *2;
	}
	image = bmpImage(width,height,cfg.bit)
	image.setBgColor(0xffffff, cfg.odd);
	var drawed=0, x=0,y=0, w=0, h=0,wave=cfg.wave,pi=3.141592653589793;
	for(var i=0;i<vCode.length;i++){
		achar = vCode[i]; w = achar.width; h = achar.height; 
		//achar.change(F.random(-1,1) * pi / F.random(6,12));
		x = drawed + padding + (wave?(Math.floor(Math.random() * (w / 2) - (w/4))):0); 
		y = padding + (wave?(Math.floor(Math.random() * (h / 2) - (h/4))):0);
		image.Char2(x, y, achar.data, w, h);
		drawed += w;
	}
	image.flush();
	return vCodes;
}
//=====================================================================
// GIF Support etc.
//
//---------------------------------------------------------------------
// byteArrayOutputStream
//---------------------------------------------------------------------
var AChar = function(data){
	var _char={},len_=0, w,h;
	_char.data = data.slice(0);
	_char.height = _char.data.pop();
	_char.width = _char.data.pop();
	len_ = _char.data.length;
	w = _char.width;
	h = _char.height;
	_char.change = function(a){
		var data2=[],p0 = Math.floor(w/2), p1 = Math.floor(h/2), x0, y0, p3,p4,sina=Math.sin(a),cosa=Math.cos(a);
		for(var i=0;i<len_;i++) data2[i] = -1;
		for(var x = 0;x<w;x++){
			p3 = (x - p0);
			for(var y=0;y<h;y++){
				p4 = (y - p1);
				x0= p3*cosa - p4*sina + p0 ;
				y0= p3*sina + p4*cosa + p1 ;
				//if(x0>=0 && x0<w && y0>=0 && y0<h) 
					data2[Math.floor(x0)*w+Math.floor(y0)] = data[x * w + y];
			}
		}
		_char.data = data2;
	};
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

	_this.Width = _width;
	_this.Height = _height;
	_this.Pixel = function(x, y, pixel) {
		var q = (height-y-1) * _pixWidth + x * _bitn;
		_data[q] = pixel & 0xff;
		_data[q + 1] = (pixel >>>8) & 0xff;
		_data[q + 2] = (pixel >>>16) & 0xff;
		if(_bitn==4) _data[q + 3] = (pixel >>>24) & 0xff;
	};
	_this.Pixel2 = function(x, y, r,g,b, a) {
		var q = (height-y-1) * _pixWidth + x * _bitn;
		_data[q] = b;
		_data[q + 1] = g;
		_data[q + 2] = r;
		if(_bitn==4) _data[q + 3] = a;
	};
	_this.Char = function(x, y, data) {
		var w = Math.sqrt(data.length), num = 0;
		for(var i =0;i<w;i++){
			for(var j=0;j<w;j++){
				((num = data[j * w + i]) != -1) && _this.Pixel(x+i, y+j, num);
			}
		}
	};
	_this.Char2 = function(x, y, data, w, h) {
		var num = 0;
		for(var j=0;j<h;j++){
			for(var i =0;i<w;i++){
				((num = data[ j * w + i]) != -1) && _this.Pixel(x+i, y+j, num);
			}
		}
	};
	_this.Rectangle = function(x, y, w , h, color) {
		for(var i=0;i<w;i++){
			_this.Pixel(x+i,y,color);
			_this.Pixel(x+i,y+h-1,color);
		}
		for(var i=0;i<h;i++){
			_this.Pixel(x,y + i,color);
			_this.Pixel(x+w-1,y+i,color);
		}
	};
	_this.Line = function(x1, y1, x2, y2, color){
		if(x1==x2){
			for(var i=y1;i<=y2;i++){
				_this.Pixel(x1,i,color);
			}
			return;
		}
		if(y1==y2){
			for(var i=x1;i<=x2;i++){
				_this.Pixel(i,y1,color);
			}
			return;
		}
		var radius = (y2-y1) / (x2-x1);
		var fn = function(x){
			return radius * (x-x1) + y1;
		}
		for(var i=x1;i<=x2;i++){
			_this.Pixel(i,Math.round(fn(i)),color);
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
					_this.Pixel2(i, j, Math.floor(Math.random() * 128), Math.floor(Math.random() * 128), Math.floor(Math.random() * 128), a);
				}else{
					_this.Pixel2(i, j, r, g, b, a);
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
	_this.flush = function(){
		F.echo(IO.buffer2binary(_this.getHeaderBuffer()),F.TEXT.BIN);
		F.echo(IO.buffer2binary(_this.getBodyBuffer()),F.TEXT.BIN);
	};
	_this.writeHeader();
	return _this;
}
exports.Safecode = $safecode;
exports.BmpImage = bmpImage;