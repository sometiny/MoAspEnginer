/*
** File: encoding.js
** Usage: give some methods to process text encoding.

** encoding for 'hex','gbk','utf-8','unicode'
** methods for uricomponent or uri;
** ======================================= **
** var Encoding = F.require("encoding");
** Encoding.encodeURIComponent(string,enc);
** Encoding.encodeURI(string,enc);
** Encoding.decode(string,enc);
** ======================================= **
** Encoding.hex.parse(string);
** Encoding.hex.stringify(byte[]);
** ======================================= **
** Encoding.utf8.getWordArray(string);
** Encoding.utf8.getByteArray(string);
** Encoding.utf8.bytesToWords(byte[]);
** Encoding.utf8.toString(word[]);
** ======================================= **
** Encoding.gbk.getWordArray(string);
** Encoding.gbk.getByteArray(string);
** Encoding.gbk.bytesToWords(byte[]);
** Encoding.gbk.toString(word[]);
** ======================================= **
** Encoding.unicode.getWordArray(string);
** Encoding.unicode.getByteArray(string);
** Encoding.unicode.bytesToWords(byte[]);
** Encoding.unicode.toString(word[]);
** ======================================= **
** var base64str_e = F.base64.e(Encoding.gbk.getByteArray("admin"));
** var base64str_d = Encoding.gbk.toString(Encoding.gbk.bytesToWords(F.base64.d(base64str_e)));

** About: 
**		support@mae.im
*/
return exports.encoding=exports.encoding||(function(){
	var _SPEC={};
	_SPEC.S1 = "1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM-_.!~*'()";/*for URIComponent*/
	_SPEC.S2 = "1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM-_.!~*'();/?:@&=+$,#";/*for URI*/
	var $enc={};
	$enc.wordtobytes = function(u){
		if(u>0xffffffff)return [];
		else if(u>0xffffff) {
			return [u >>> 24,(u >> 16) & 0xff,(u >> 8) & 0xff,u & 0xff];
		}
		else if(u>0xffff) {
			return [u >> 16,(u >> 8) & 0xff,u & 0xff];
		}
		else if(u>0xff) {
			return [u >> 8,u & 0xff];
		}
		else{
			return [u];
		}
	};
	$enc.encodeURIComponent = function(string,enc){
		return $enc.encode(string,enc,"S1");
	};
	$enc.encodeURI = function(string,enc){
		return $enc.encode(string,enc,"S2");
	};
	$enc.decode = function(string,enc){
		enc = (enc || "utf-8").toUpperCase();
		var $enc = exports.encoding[enc=="UTF-8"?"utf8":"gbk"];
		var i=0,c,ret=[];
		while(i<string.length){
			c = string.substr(i,1);
			if(c=="%" && /^%([0-9a-z]{2})$/i.test(string.substr(i,3))){
				ret.push(parseInt("0x"+string.substr(i+1,2)));
				i+=2;
			}else{
				ret.push(string.charCodeAt(i));
			}
			i++;
		}
		return $enc.toString($enc.bytesToWords(ret));
	};
	$enc.encode = function(string,enc,t){
		enc = (enc || "utf-8").toUpperCase();
		t = (t || "S1").toUpperCase();
		var ret="", i=0, c, chr, bytes = exports.encoding[enc=="UTF-8"?"utf8":"gbk"].getWordArray(string);
		while(i<bytes.length){
			c = bytes[i++];
			if(c<=0x7f){
				chr = String.fromCharCode(c);
				if(_SPEC[t].indexOf(chr)>=0) ret += chr;
				else ret += "%" + exports.encoding.hex.stringify([c]);
			}else{
				var hex = c.toString(16);
				if(hex.length%2!=0)hex="0"+hex;
				ret += hex.replace(/([0-9a-z]{2})/ig,"%$1");
			}
		}
		return ret;
	};
	$enc.decodeURI = $enc.decodeURIComponent = $enc.decode;
	$enc.hex = $enc.hex || (function(){
		var $hex = {};
		$hex.parse = function(string){
			if(string.length%2!=0)return [];
			if(/[^0-9a-z]/i.test(string)){
				ExceptionManager.put(new Exception(0xb0a2,"encoding.hex.parse","invalid input string."));
				return [];
			}
			var i=0,c,ret=[];
			while(i<string.length-1){
				ret.push(parseInt(string.substr(i,2),16));
				i+=2;
			}
			return ret;
		};
		$hex.stringify = function(bytes){
			var ret="",c,v,i=0;
			while(i<bytes.length){
				v = bytes[i++];
				if(v>255){
					ExceptionManager.put(new Exception(0xb0a3,"encoding.hex.stringify","invalid input array, item value is bigger than 255."));
					break;
				}
				c = ("0"+v.toString(16));
				ret+=c.substr(c.length-2);
			}
			return ret;
		};
		return $hex;
	})();
	$enc.utf8 = $enc.utf8 || (function(){
		var utoutf8=function(u){
			var a,b,c,d;
			if(u<=0x7f) return u;
			else if(u<=0x07FF){
				a = 0xc0 | (u >> 6);
				b = 0x80 | (u & 0x3f);
				return (a<<8)+b;
			}
			else if(u<=0xFFFF){
				a = 0xe0 | (u >> 12);
				b = 0x80 | ((u >> 6) & 0x3f);
				c = 0x80 | (u & 0x3f);
				return (a<<16)+(b<<8)+c;
			}
			else if(u<=0x10FFFF){
				a = 0xf0 | (u >> 18);
				b = 0x80 | ((u >> 12) & 0x3f);
				c = 0x80 | ((u >> 6) & 0x3f);
				d = 0x80 | (u & 0x3f);
				var ret = (a<<24)+(b<<16)+(c<<8)+d;
				if(ret<0)ret+=0x100000000;
				return ret;
			}else return 0;
		};
		var utf8tou=function(u){
			var a,b,c,d;
			if(u<=0x7f) return u;
			else if(u<=0xdfbf) {
				a = (u >> 8) & 0x1f;
				b = u & 0x3f;
				return (a << 6) + b;
			}
			else if(u<=0xefbfbf) {
				a = (u >> 16) & 0xf;
				b = (u >> 8) & 0x3f;
				c = u & 0x3f;
				return (a << 12) + (b << 6) + c;
			}
			else if(u<=0xf48fbfbf) {
				a = (u >>> 24) & 0x7;
				b = (u >> 16) & 0x3f;
				c = (u >> 8) & 0x3f;
				d = u & 0x3f;
				return (a << 18) + (b << 12) + (c << 6) + d;
			}
			else return 0;
		};
		var bytestoword = function(u,i){
			var c = u[i],ret=[1,c];
			if(c<=0x7f)ret[1]=c;
			else if(c<=0xDF){
				ret[1]=(c << 8) + u[i+1];
				ret[0]=2;
			}else if(c<=0xEF){
				ret[1]=(c << 16) + (u[i+1] << 8) + u[i+2];
				ret[0]=3;
			}else if(c<=0xF7){
				ret[1]=(c << 24) + (u[i+1] << 16) + (u[i+2] << 8) + u[i+3];
				ret[0]=4;
			}
			return ret;	
		};
		var $utf8={};
		$utf8.getWordArray = function(u){
			if(u.length<=0)return [];
			var i=0,c,ret=[];
			while(i<u.length){
				c = u.charCodeAt(i);
				if(c<0x7f) ret.push(c);
				else{
					ret.push(utoutf8(c));
				}
				i++;
			}
			return ret;
		};
		$utf8.bytesToWords = function(u){
			if(u.length<=0)return [];
			var i=0,c,ret=[];
			while(i<u.length){
				var word = bytestoword(u,i);
				ret.push(word[1]);
				i+=word[0];
			}
			return ret;
		};
		$utf8.getByteArray = function(u){
			if(u.length<=0)return [];
			var i=0,c,ret=[];
			while(i<u.length){
				c = u.charCodeAt(i);
				if(c<0x7f) ret.push(c);
				else{
					ret = ret.concat($enc.wordtobytes(utoutf8(c)));
				}
				i++;
			}
			return ret;
		};
		$utf8.toString = function(u){
			if(u.length<=0)return "";
			var i=0,c,ret="";
			while(i<u.length){
				if(u[i]<0x7f) ret+=String.fromCharCode(u[i]);
				else{
					ret+=String.fromCharCode(utf8tou(u[i]));
				}
				i++;
			}
			return ret;			
		};
		$utf8.getString = function(u){
			if(u.length<=0)return [];
			var i=0,c,ret="";
			while(i<u.length){
				var word = bytestoword(u,i);
				ret+=String.fromCharCode(utf8tou(word[1]));
				i+=word[0];
			}
			return ret;
		};
		return $utf8;
	})();
	$enc.gbk = $enc.gbk || (function(){
		var CP = {gbk:{filepath:{u2g:__DIR__ +"\\exts\\UtoG.sys",g2u:__DIR__ +"\\exts\\GtoU.sys"},stream:{u2g:null,g2u:null}}};
		var u2g=function(u){
			var offset,ret=[];
			if(u<=0X9FA5)offset=u-0x4E00;
			else if(u>0x9FA5)
			{
				if(u<0xFF01||u>0xFF61)return 0;
				offset=u-0xFF01+0x9FA6-0x4E00;
			}  
			CP.gbk.stream.u2g.position=offset*2;
			return F.base64.d(F.base64.fromBinary(CP.gbk.stream.u2g.read(2)));
		};
		var g2u=function(g){
			var offset, ch = g >> 8, cl = g & 0xff;
			ch -= 0x81;
			cl -= 0x40;
			if(ch<=0x7d && cl<=0xbe){
				CP.gbk.stream.g2u.position=(ch*0xbf+cl)*2;
				return F.base64.d(F.base64.fromBinary(CP.gbk.stream.g2u.read(2)));
			}else{
				return [0x1f,0xff];
			}
		};
		var opencp = function(cp){
			cp = cp || "u2g";
			if(!F.exists(CP.gbk.filepath[cp])){
				ExceptionManager.put(new Exception(0xb0a1,"encoding.gbk.[opencp]","codepage file is not exists."));
				return false;
			}
			CP.gbk.stream[cp] = F.stream(3,1);
			CP.gbk.stream[cp].open();
			CP.gbk.stream[cp].LoadFromFile(CP.gbk.filepath[cp]);
			return true;	
		};
		var closecp = function(cp){
			cp = cp || "u2g";
			CP.gbk.stream[cp].close();
			CP.gbk.stream[cp]=null;
		};
		var $gbk={};
		$gbk.Test = function(u){
			opencp();
			var ret = u2g(u.charCodeAt(0));
			closecp();
			return ret;
		};
		$gbk.getWordArray = function(u){
			if(u.length<=0)return [];
			if(!opencp())return [];
			var i=0,c,ret=[];
			while(i<u.length){
				c = u.charCodeAt(i);
				if(c<0x7f) ret.push(c);
				else{
					var g=u2g(c);
					ret.push((g[0]<<8) + g[1]);
				}
				i++;
			}
			closecp();
			return ret;
		};
		$gbk.getByteArray = function(u){
			if(u.length<=0)return [];
			if(!opencp())return [];
			var i=0,c,ret=[];
			while(i<u.length){
				c = u.charCodeAt(i);
				if(c<0x7f) ret.push(c);
				else ret = ret.concat(u2g(c)); 
				i++;
			}
			closecp();
			return ret;
		};
		$gbk.bytesToWords = function(u){
			if(u.length<=0)return [];
			var i=0,c,ret=[];
			while(i<u.length){
				c = u[i];
				if(c<=0x7f)ret.push(c);
				else{
					ret.push((c << 8) + u[i+1]);
					i++;
				}
				i++;
			}
			return ret;
		};
		$gbk.toString = function(bytes){
			if(bytes.length<=0)return "";
			if(!opencp("g2u"))return "";
			var ret="",i=0;
			while(i<bytes.length){
				if(bytes[i]<0x7f) ret+=String.fromCharCode(bytes[i]);
				else{
					var u = g2u(bytes[i]);
					ret+=String.fromCharCode((u[1]<<8)+u[0]);
				}
				i++;
			}
			closecp("g2u");
			return ret;
		};
		$gbk.getString = function(u){
			if(u.length<=0)return "";
			var i=0,c,ret="";
			if(!opencp("g2u"))return "";
			while(i<u.length){
				c = u[i];
				if(c<=0x7f)ret+=String.fromCharCode(c);
				else{
					var b = g2u((c << 8) + u[i+1]);
					ret+=String.fromCharCode((b[1]<<8)+b[0]);
					i++;
				}
				i++;
			}
			closecp("g2u");
			return ret;
		};
		return $gbk;
	})();
	$enc.unicode = $enc.unicode || (function(){
		var $unicode={};
		$unicode.getWordArray = function(u){
			if(u.length<=0)return [];
			var i=0,c,ret=[];
			while(i<u.length){
				ret.push(u.charCodeAt(i++));
			}
			return ret;
		};
		$unicode.getByteArray = function(u){
			if(u.length<=0)return [];
			var i=0,c,ret=[];
			while(i<u.length){
				c=u.charCodeAt(i++);
				ret.push( c & 0xff);
				ret.push( (c>>8) & 0xff); /*Little-Endian*/
			}
			return ret;
		};
		$unicode.bytesToWords = function(u){
			if(u.length<=0)return [];
			var i=0,c,ret=[];
			while(i<u.length-1){
				ret.push( (u[i+1]<<8) +u[i]); /*Little-Endian*/
				i+=2;
			}
			return ret;
		};
		$unicode.toString = function(u){
			if(u.length<=0)return "";
			var i=0,c,ret="";
			while(i<u.length){
				ret+=String.fromCharCode(u[i++]);
			}
			return ret;
		};
		$unicode.getString = function(u){
			if(u.length<=0)return "";
			var i=0,c,ret="";
			while(i<u.length-1){
				ret+=String.fromCharCode((u[i+1]<<8) +u[i]); /*Little-Endian*/
				i+=2;
			}
			return ret;
		};
		return $unicode;
	})();
	$enc.gbk.getBytes = $enc.gbk.getByteArray;
	$enc.gbk.getWords = $enc.gbk.getWordArray;
	$enc.utf8.getBytes = $enc.utf8.getByteArray;
	$enc.utf8.getWords = $enc.utf8.getWordArray;
	$enc.unicode.getBytes = $enc.unicode.getByteArray;
	$enc.unicode.getWords = $enc.unicode.getWordArray;
	return $enc;
})();