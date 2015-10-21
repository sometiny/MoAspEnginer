/*debug*/
/*
** tar package£¬Old-Style Archive Format
*/
var string2buffer = Utf8.getByteArray, buffer2string = Utf8.getString;

function zipfolder(zip,path){
	IO.directory.directories(path,function(f){
		zipfolder(zip.folder(f.name),f.path);
	});
	IO.directory.files(path,function(f){
		zip.file(f.name,f.path);
	});
}

function $manager(files, options){
	if(this.constructor!==$manager){
		return Function.Create(arguments.length).apply($manager, arguments);
	}
	this.options = options || {};
	this.files = files || {};
}
$manager.helper = zipfolder;
$manager.prototype.folder = function(name){
	this.files[name] = {};
	return new $manager(this.files[name]);
};
$manager.prototype.file = function(name, path){
	this.files[name] = path;
	return this;
};
$manager.prototype.generate = function(target, ignoreemptyfolder){
	//dump(this.files);return;
	ignoreemptyfolder = ignoreemptyfolder!==false;
	Response.ContentType = "application/x-tar";
	Response.AddHeader("Content-Disposition", "attachment; filename=\"" + target + "\"");
	dogenerate("", this.files, ignoreemptyfolder);
	var ending = [];
	for(var i=0;i<1024;i++) ending.push(0);
	Response.BinaryWrite(IO.buffer2binary(ending));
	return result;
};
function dogenerate(name, files, ignoreemptyfolder){
	for(var i in files){
		if(!files.hasOwnProperty(i)) continue;
		var file = files[i];
		if(typeof file == "string"){
			try{
				var fp = IO.file.open(file, {forText:false,forRead:true});
				var header = tarHeader(name + i, file, false);
				header.generate(IO.get_filesize(fp));
				Response.BinaryWrite(IO.buffer2binary(header.data));
				if(header.filesize>0){
					IO.file.writeToResponse(fp);
				}
				IO.file.close(fp);
				var padding= header.filesize % 512;
				if(padding>0){
					var pad = [];
					for(var j=0;j<512-padding;j++) pad.push(0);
					Response.BinaryWrite(IO.buffer2binary(pad));
					Response.Flush();
				}
			}catch(ex){
				MEM.put(ex.number, "TarStream.dogenerate", ex.description + name + i);
			}
		}else{
			if(!ignoreemptyfolder){
				var header = tarHeader(name + i, "", true);
				header.generate(0);
				Response.BinaryWrite(IO.buffer2binary(header.data));
				Response.Flush();
			}
			dogenerate(name + i + "\\", file, ignoreemptyfolder);
		}
	}
}
$manager.setNames = function(){
	if(typeof GBK != "undefined"){
		string2buffer = GBK.getByteArray;
		buffer2string = GBK.getString;
	}
};
$manager.packFolder = function(path, target, ignoreemptyfolder){
	var zip = new $manager();
	try{
		zipfolder(zip,path);
		return zip.generate(target, ignoreemptyfolder);
	}catch(ex){
		return false;
	}
}
$manager.packFile = function(file, target){
	option = F.extend({filename:null},option);
	var filename = option.filename || file.substr(file.lastIndexOf("\\")+1);
	var zip = new $manager();
	try{
		zip.file(filename,file);
		return zip.generate(target);
	}catch(ex){
		return false;
	}
}
var ArrayPush = Array.prototype.push;
var formatOtc = function(num, len){
	var numstr = num.toString(8)+" ", _len = numstr.length;
	len = len || 12;
	while(_len < len){
		numstr = " " + numstr;
		_len++;
	}
	return string2buffer(numstr);
};
var readstringbuffer = function(buffer, start, end){
	var buff=[],chr=0;
	for(var i=start;i<end;i++){
		chr = buffer[i];
		if(chr==0) break;
		buff.push(chr);
	}
	return buff;
};
var parseOtc = function(ary){
	ary.pop();
	var i=0;
	while(ary[i]==0x20){
		ary.shift();
	}
	return parseInt(buffer2string(ary),8);
};
function push(src , dest){
	var _len = src.length;
	for(var i=0 ;i<_len;i++){
		dest.checksum += src[i];
	}
	ArrayPush.apply(dest.data, src);
}
function set(src, start, dest){
	var _len = src.length;
	for(var i=0 ;i<_len;i++){
		dest.data[start+i] = src[i];
	}
}
var tarHeader = function(name, file, isdir) {
	if(this.constructor != tarHeader){
		return new tarHeader(name, file, isdir);
	}
	this.name = name;
	this.filesize = 0;
	this.file= file;
	this.dir = !!isdir;
	this.data = [];
	this.checksum=0;
	this.offset=0;
	this.createdate=0;
};
var total=0;
tarHeader.prototype.generate = function(filesize){
	var filename_byt = string2buffer(this.name),prefix=[], _len = filename_byt.length, createdate,Header = this.data;
	if(_len>99){
		var _index = this.name.indexOf("\\"), last=0, chrcode, counts=0;
		if(_index>0){
			for(var i=_len-1;i>=0;i--){
				if(filename_byt[i]==0x5c && i<155) {
					last = i;
					break;
				}
			}
			prefix = filename_byt.slice(0,last)
			filename_byt = filename_byt.slice(last+1);
		}else{
			filename_byt = filename_byt.slice(_len-99);
		}
	}
	while(filename_byt.length<100) filename_byt.push(0);
	push(filename_byt, this);
	if(this.dir){
		ArrayPush.apply(Header, [0x20,0x34]);
		this.checksum += 84;
		createdate = +new Date();
	}else{
		ArrayPush.apply(Header, [0x31,0x30]);
		this.checksum += 97;
		createdate = +new Date(+IO.file.get(this.file).DateLastModified);
	}
	ArrayPush.apply(Header, [0x30,0x37,0x37,0x37,0x20,0, /*mode*/ 0x20,0x20,0x20,0x20,0x20,0x30,0x20,0,0x20,0x20,0x20,0x20,0x20,0x30,0x20,0]); //uid,gid
	this.checksum += 725;
	
	var linkflag=0x35;
	if(!this.dir) {
		this.filesize = filesize;
		linkflag = 0x30;
	}
	push(formatOtc(filesize), this); //size
	push(formatOtc((createdate - createdate % 1000)/1000), this); //mtime
	
	ArrayPush.apply(Header, [0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20]); //checksum
	this.checksum += 256;
	
	Header.push(linkflag); //linkflah
	this.checksum += linkflag;
	for(var i=0;i<100;i++) Header.push(0); //linkname
	
	ArrayPush.apply(Header, [0x75,0x73,0x74,0x61,0x72,0,0x30,0x30]); //magic //version
	this.checksum += 655;
	
	for(var i=0;i<80;i++) Header.push(0); //uname, gname,devmajor, devminor
	push(prefix, this); //prefix
	for(var i=0;i<167-prefix.length;i++) Header.push(0); //prefix ending and pad
	
	set(formatOtc(this.checksum,7),148, this); //set checksum
	Header[155] = 0;
};
module.exports = $manager;