/*
** File: net/http/upload.js
** Usage: a library for upload files and form data to remote host.
** 		inherit form 'http.request'.
** New Methods:
**		appendFile(key,value,contenttype);
**			@parameters key [string], form name.
**			@parameters value [string], file path.
**			@parameters contenttype [string], file contenttype.
**			
**		appendForm(key,value);
**			@parameters key [string], form name.
**			@parameters value [string], form value.
**			
** About: 
**		support@mae.im
*/
var _httprequest = require("./request.js");
var $string2bytes = function(string){
	return base64.toBinary(base64.encode(string))
};
var $writefileto = function(path,destStream){
	if(!IO.file.exists(path))return;
	var stream = F.activex("ADODB.STREAM");
	stream.type=1;
	stream.mode=3;
	stream.open();
	stream.loadfromfile(path);
	stream.position=0;
	stream.CopyTo(destStream);
	stream.close();
	stream = null;
};

function $httpupload(url, opt){
	if(!(this instanceof $httpupload)) return new $httpupload(url, opt);
	_httprequest.apply(this,[url,"POST","",false]);
	this.boundary = F.random.letter(22);
	this.forms=[];
	if(opt)
	{
		if(opt.files)
		{
			for(var i in opt.files)
			{
				if(!opt.files.hasOwnProperty(i))continue;
				var value = opt.files[i];
				if(typeof value == "string")
				{
					this.appendFile(i, value);
				}else{
					this.appendFile(i, value["path"], value["contentType"]);
				}
			}
		}
		
		if(opt.forms)
		{
			for(var i in opt.forms)
			{
				if(!opt.forms.hasOwnProperty(i))continue;
				this.appendForm(i, opt.forms[i]);
			}
		}
	}
}
$httpupload.create = function(url, opt)
{
	return new $httpupload(url, opt);
};
$httpupload.prototype = new _httprequest();
$httpupload.fn = $httpupload.prototype;
$httpupload.fn.appendFile = function(key,value,contenttype){
	contenttype = contenttype ||"application/octet-stream";
	var path = F.mappath(value);
	if(!IO.file.exists(path))return;
	this.forms.push({"type":"file", "name":key, "path":path,"filename":path.substr(path.lastIndexOf("\\")+1),"contenttype":contenttype});
};
$httpupload.fn.appendForm = function(key,value){
	this.forms.push({"type":"form", "name":key, "value":value});
};
$httpupload.fn.init=function(){
	var datasetstr="";
	this.response=null;
	if(this.method=="POST") this.headers.push("Content-Type:multipart/form-data; boundary=" + this.boundary);
	if(!this.charset || this.charset=="") this.charset = "utf-8";
};
$httpupload.fn.send = function(url){
	if(url!==undefined)this.url = url;
	var stream = F.activex("ADODB.STREAM");
	stream.type=1;
	stream.mode=3;
	stream.open();
	for(var i=0;i<this.forms.length;i++){
		if(this.forms[i]["type"]=="form"){
			stream.write($string2bytes(F.format("--{0}\r\nContent-Disposition: form-data; name=\"{1}\"\r\n\r\n{2}\r\n", this.boundary, this.forms[i]["name"],this.forms[i]["value"])));
		}else{
			stream.write($string2bytes(F.format("--{0}\r\nContent-Disposition: form-data; name=\"{1}\"; filename=\"{2}\"\r\nContent-Type: {3}\r\n\r\n", this.boundary, this.forms[i]["name"],this.forms[i]["filename"], this.forms[i]["contenttype"],6179)));
			$writefileto(this.forms[i]["path"],stream);
            stream.write($string2bytes("\r\n"));
		}
	}
	stream.write($string2bytes(F.format("--{0}--\r\n", this.boundary)));
	stream.position=0;
	this.data = stream;
	this.header("Content-Length:" + stream.size);
	_httprequest.prototype.send.call(this);
	stream.close();
	stream = null;
	return this;
};

$httpupload.fn.uploadFromClient = function(){
	var TotalBytes = Request.TotalBytes,BytesRead=0,ChunkReadSize=1024 * 16,PartSize;
	var stream = F.activex("ADODB.STREAM");
	stream.type=1;
	stream.mode=3;
	stream.open();
	while(BytesRead < TotalBytes){
		PartSize = ChunkReadSize
		if(PartSize + BytesRead > TotalBytes) PartSize = TotalBytes - BytesRead;
		stream.write(Request.BinaryRead(PartSize));
		BytesRead = BytesRead + PartSize;
	}
	stream.position=0;
	this.data = stream;
	this.header("Content-Length:" + stream.size);
	this.send(function(){
		var newheaders=[];
		for(var i=0;i<this.headers.length;i++){
			if(!F.string.startWith(this.headers[i],"Content-Type:")){
				newheaders.push(this.headers[i]);
			}
		}
		this.headers = newheaders;
		this.header("Content-Type:" + F.server("CONTENT_TYPE"));
	});
	stream.close();
	stream = null;
	return this;
};
module.exports = $httpupload;