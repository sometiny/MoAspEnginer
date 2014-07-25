<script language="jscript" runat="server">
Mo.Use("HttpRequest");
function MoLibHttpUpload(url){
	MoLibHttpRequest.apply(this,[url,"POST","",false]);
	this.boundary = F.random.letter(22);
	this.forms=[];
}
MoLibHttpUpload.prototype = new MoLibHttpRequest();
MoLibHttpUpload.New = MoLibHttpUpload.prototype.New = function(url){
	return new MoLibHttpUpload(url);
};
MoLibHttpUpload.prototype.appendfile = function(key,value,contenttype){
	contenttype = contenttype ||"application/octet-stream";
	var path = F.mappath(value);
	if(!F.fso.fileexists(path))return;
	this.forms.push({"type":"file", "name":key, "path":path,"filename":path.substr(path.lastIndexOf("\\")+1),"contenttype":contenttype});
};
MoLibHttpUpload.prototype.appendform = function(key,value){
	this.forms.push({"type":"form", "name":key, "value":value});
};
MoLibHttpUpload.prototype.init=function(){
	var datasetstr="";
	this.response=null;
	if(this.method=="POST") this.headers.push("Content-Type:multipart/form-data; boundary=" + this.boundary);
	if(!this.charset || this.charset=="") this.charset = "utf-8";
};
MoLibHttpUpload.prototype.upload = function(url){
	if(url!==undefined)this.url = url;
	var stream = F.activex("ADODB.STREAM");
	stream.type=1;
	stream.mode=3;
	stream.open();
	for(var i=0;i<this.forms.length;i++){
		if(this.forms[i]["type"]=="form"){
			stream.write(MoLibHttpUpload.string2bytes(F.format("--{0}\r\nContent-Disposition: form-data; name=\"{1}\"\r\n\r\n{2}\r\n", this.boundary, this.forms[i]["name"],this.forms[i]["value"])));
		}else{
			stream.write(MoLibHttpUpload.string2bytes(F.format("--{0}\r\nContent-Disposition: form-data; name=\"{1}\"; filename=\"{2}\"\r\nContent-Type: {3}\r\n\r\n", this.boundary, this.forms[i]["name"],this.forms[i]["filename"], this.forms[i]["contenttype"],6179)));
			stream.write(MoLibHttpUpload.readbinaryfile(this.forms[i]["path"]));
            stream.write(MoLibHttpUpload.string2bytes("\r\n"));
		}
	}
	stream.write(MoLibHttpUpload.string2bytes(F.format("--{0}--\r\n", this.boundary)));
	stream.position=0;
	this.data = stream;
	this.header("Content-Length:" + stream.size);
	this.send();
	stream.close();
	stream = null;
	return this;
};

MoLibHttpUpload.prototype.uploadfromclient = function(){
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

MoLibHttpUpload.string2bytes = function(string){
	var src = Mo.Static("Base64").Encode(string);
	return Mo.Static("Base64").DecodeBinary(src)
};
MoLibHttpUpload.filesize=0;
MoLibHttpUpload.readbinaryfile = function(path){
	if(!F.fso.fileexists(path))return null;
	var stream = F.activex("ADODB.STREAM");
	stream.type=1;
	stream.mode=3;
	stream.open();
	stream.loadfromfile(path);
	MoLibHttpUpload.filesize = stream.size;
	stream.position=0;
	var result = stream.read();
	stream.close();
	stream = null;
	return result;
};
</script>