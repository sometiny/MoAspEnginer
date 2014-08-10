if(!exports.http)exports.http={};
F.require("http.request");
function $httpupload(url){
	F.exports.http.request.apply(this,[url,"POST","",false]);
	this.boundary = F.random.letter(22);
	this.forms=[];
}
$httpupload.prototype = new F.exports.http.request();
$httpupload.fn = $httpupload.prototype;
$httpupload.New = $httpupload.fn.New = function(url){
	return new $httpupload(url);
};
$httpupload.fn.appendfile = function(key,value,contenttype){
	contenttype = contenttype ||"application/octet-stream";
	var path = F.mappath(value);
	if(!F.fso.fileexists(path))return;
	this.forms.push({"type":"file", "name":key, "path":path,"filename":path.substr(path.lastIndexOf("\\")+1),"contenttype":contenttype});
};
$httpupload.fn.appendform = function(key,value){
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
			stream.write($httpupload.string2bytes(F.format("--{0}\r\nContent-Disposition: form-data; name=\"{1}\"\r\n\r\n{2}\r\n", this.boundary, this.forms[i]["name"],this.forms[i]["value"])));
		}else{
			stream.write($httpupload.string2bytes(F.format("--{0}\r\nContent-Disposition: form-data; name=\"{1}\"; filename=\"{2}\"\r\nContent-Type: {3}\r\n\r\n", this.boundary, this.forms[i]["name"],this.forms[i]["filename"], this.forms[i]["contenttype"],6179)));
			stream.write($httpupload.readbinaryfile(this.forms[i]["path"]));
            stream.write($httpupload.string2bytes("\r\n"));
		}
	}
	stream.write($httpupload.string2bytes(F.format("--{0}--\r\n", this.boundary)));
	stream.position=0;
	this.data = stream;
	this.header("Content-Length:" + stream.size);
	F.exports.http.request.prototype.send.call(this);
	stream.close();
	stream = null;
	return this;
};

$httpupload.fn.uploadfromclient = function(){
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

$httpupload.string2bytes = function(string){
	return F.base64.getBytes(F.base64.encode(string))
};
$httpupload.filesize=0;
$httpupload.readbinaryfile = function(path){
	if(!F.fso.fileexists(path))return null;
	var stream = F.activex("ADODB.STREAM");
	stream.type=1;
	stream.mode=3;
	stream.open();
	stream.loadfromfile(path);
	$httpupload.filesize = stream.size;
	stream.position=0;
	var result = stream.read();
	stream.close();
	stream = null;
	return result;
};
return exports.http.upload = $httpupload;