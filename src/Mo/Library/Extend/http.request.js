/****************************************************
'@DESCRIPTION:	define MoLibHttpRequest object. All the parms can be assigned after create instance
'@PARAM:	url [String[option]] : target URL.
'@PARAM:	method [String[option]] : request method. POST/GET/HEADER....
'@PARAM:	data [String[option]] : data need to send
'@PARAM:	autoClearBuffer [Boolean[option]] : auto clear buffer when request
'****************************************************/
function MoLibHttpRequest(url,method,data,autoClearBuffer){
	if(typeof method=="undefined") method="GET";
	if(typeof data=="undefined") data="";
	if(typeof autoClearBuffer=="undefined") autoClearBuffer=true;
	if(method=="")method="GET";
	method = method.toUpperCase();
	if(method=="POST") autoClearBuffer=false;
	this.timeout=[10000,10000,10000,30000];
	this.istimeout=false;
	this.sended = false;
	this.method = method;
	this.url=url;
	this.data=data;
	this.charset="utf-8";
	this.http=null;
	this.headers=[];
	this.status=0;
	this.readyState=0;
	this.content=null;
	this.msg="";
	this.autoClearBuffer = autoClearBuffer;
	this.response=null;
	this.dataset={
		charset:"utf-8",
		data:[],
		append:function(key,value,noencode){
			var fn=null;
			if(this.charset.toLowerCase()=="utf-8"){
				fn = function(_str){
					return encodeURIComponent(_str).replace(/\+/igm,"%2B").replace(/\//igm,"%2F");
				};
			}else{
				fn = function(_str){
					return escape(_str).replace(/\+/igm,"%2B").replace(/\//igm,"%2F");
				};
			}
			if(noencode==true){fn=function(_str){return _str;}}
			this.data.push({"key":fn(key),"value":fn(value)});
		},
		remove:function(key){
			if(this.data.length<=0) return false;
			var _data=[];
			for(var i=0;i<this.data.length;i++){
				if(this.data[i].key!=key){1
					_data.push(this.data[i]);
				}
			}
			this.data = _data;
		},
		isexists:function(key){
			if(this.data.length<=0) return false;
			for(var i=0;i<this.data.length;i++){
				if(this.data[i].key==key){
					return true;
				}
			}
			return false;
		},
		clear:function(){
			this.dataset.data=[];	
		}
	};
}
/****************************************************
'@DESCRIPTION:	create an instance of MoLibHttpRequest
'@PARAM:	url [String[option]] : target URL.
'@PARAM:	method [String[option]] : request method. POST/GET/HEADER....
'@PARAM:	data [String[option]] : data need to send
'@PARAM:	autoClearBuffer [Boolean[option]] : auto clear buffer when request
'@RETURN:	[Object] instance of MoLibHttpRequest
'****************************************************/
MoLibHttpRequest.New = MoLibHttpRequest.prototype.New = function(url,method,data,autoClearBuffer){
	return new MoLibHttpRequest(url,method,data,autoClearBuffer);	
};

/****************************************************
'@DESCRIPTION:	init. I will call this method automaticly.
'****************************************************/
MoLibHttpRequest.prototype.init=function(){
	var datasetstr="";
	this.response=null;
	if(this.dataset.data.length>0){
		  for(var i=0;i<this.dataset.data.length;i++){
			  datasetstr += this.dataset.data[i].key + "=" + this.dataset.data[i].value + "&";
		  }
	}
	if(datasetstr!="") datasetstr = datasetstr.substr(0,datasetstr.length-1);
	if(this.data==""){this.data = datasetstr;}else{if(datasetstr!="")this.data+= "&" + datasetstr;}
	if(this.data=="")this.data=null;
	var sChar=((this.url.indexOf("?")<0) ? "?" : "&");
	if(this.data!=null) this.url += sChar + this.data;
	if(this.method=="GET" && this.autoClearBuffer){
		this.headers.push("If-Modified-Since:0");
		this.headers.push("Cache-Control:no-cache");
	}
	if(this.method=="POST") this.headers.push("Content-Type:application/x-www-form-urlencoded");
	if(!this.charset || this.charset=="") this.charset = "utf-8";	
};

/****************************************************
'@DESCRIPTION:	set http request header
'@PARAM:	headstr [String] : hearder string. eg: header("User-Agent:MoHttpRequest1.0")
'@RETURN:	[Object] return self;
'****************************************************/
MoLibHttpRequest.prototype.header=function(headstr){
	if(headstr.indexOf(":")>=0) this.headers.push(headstr);
	return this;
};

/****************************************************
'@DESCRIPTION:	set http request timeout. Support four argument at most.
'@RETURN:	[Object] return self;
'****************************************************/
MoLibHttpRequest.prototype.timeout=function(){
	if(arguments.length>4){return this;}
	for(var i =0;i<arguments.length;i++){
		if(!isNaN(arguments[i])){
			this.timeout[i] = parseInt(arguments[i]);	
		}	
	}
	return this;
};

/****************************************************
'@DESCRIPTION:	send request.if you don't call this method,I will call it automaticly.
'@RETURN:	[Object] return self;
'****************************************************/
MoLibHttpRequest.prototype.send=function(fn){
	this.init();
	if(typeof fn=="function")fn.apply(this,[]);
	this.http = this.getobj();
	if(this.http==null){return this;}
	try{
		this.http.setOption(2)=13056;
		this.http.setTimeouts(this.timeout[0], this.timeout[1], this.timeout[2], this.timeout[3]);
	}catch(ex){}
	this.http.open(this.method,this.url,false);
	if(this.headers.length>0){
		for(var i=0;i<this.headers.length;i++){
			var Sindex = this.headers[i].indexOf(":");
			var key = this.headers[i].substr(0,Sindex);
			var value = this.headers[i].substr(Sindex+1);
			this.http.setRequestHeader(key,value);
		}	
	}
	try{
		this.http.send(this.data);
		this.sended = true;
		this.readyState = this.http.readyState;
		if(this.http.readyState==4){
			this.status = parseInt(this.http.status);
			this.content = this.http.responseBody;
		}
	}catch(ex){
		this.sended = true;
		this.readyState = -1;
		this.msg = ex.description;
	}
	return this;
}
/****************************************************
'@DESCRIPTION:	save http response to local file
'@PARAM:	filepath [String] : local file path
'@RETURN:	[Object] return self;
'****************************************************/
MoLibHttpRequest.prototype.saveToFile=function(filepath){
		if(!this.sended)this.send();
		var Objstream =new ActiveXObject("Adodb.Stream");
		Objstream.Type = 1;
		Objstream.Mode = 3;
		Objstream.Open();
		Objstream.Write(this.content);
		Objstream.saveToFile(filepath,2);
		Objstream.Close();
		Objstream = null;
		return this;
};

/****************************************************
'@DESCRIPTION:	fetch response as binary
'@RETURN:	[Binary] response binary
'****************************************************/
MoLibHttpRequest.prototype.getbinary=function(){
	if(!this.sended)this.send();
	return this.content;
};

/****************************************************
'@DESCRIPTION:	fetch response as text
'@PARAM:	charset [String] : text charset
'@RETURN:	[String] response text
'****************************************************/
MoLibHttpRequest.prototype.gettext=function(charset){
	if(!this.sended)this.send();
	if(this.readyState==-1)return "";
	try{
	  return this.b2s(this.content,charset ? charset : this.charset);
	}catch(ex){
	  this.msg = ex.description;
	  return "";
	}		
};

/****************************************************
'@DESCRIPTION:	fetch response as json
'@PARAM:	charset [String] : text charset
'@RETURN:	[Object] json object
'****************************************************/
MoLibHttpRequest.prototype.getjson=function(charset){
	if(!this.sended)this.send();
	if(this.readyState==-1)return null;
	try{
		return (new Function("return " + this.gettext(charset) + ";"))();
	}catch(ex){
		this.msg = ex.description;
		return null;
	}	
};

/****************************************************
'@DESCRIPTION:	fetch response as json.
'@PARAM:	charset [String] : text charset
'@RETURN:	[Boolean] if json was parsed successfully, assign json object to 'response' property and return true, or return false;
'****************************************************/
MoLibHttpRequest.prototype.getjson1=function(charset){
	if(!this.sended)this.send();
	if(this.readyState==-1)return false;
	try{
		this.response = (new Function("return " + this.gettext(charset) + ";"))();
		return true;
	}catch(ex){
		this.msg = ex.description;
		return false;
	}	
};

/****************************************************
'@DESCRIPTION:	get response header
'@PARAM:	key [String] : header name
'@RETURN:	[String] header value
'****************************************************/
MoLibHttpRequest.prototype.getheader=function(key){
	if(!this.sended)this.send();
	if(key){
		if(key.toUpperCase()=="SET-COOKIE"){
			key = key.replace("-","\-");
			var headers = this.http.getAllResponseHeaders();
			var regexp = new RegExp("\n" + key + "\:(.+?)\r","ig");
			var resstr = "";
			while((res = regexp.exec(headers))!=null){
				var val = this.trim(res[1]);
				resstr = resstr + val.substr(0,val.indexOf(";")) + "; "
			}
			if(resstr!=""){
				resstr = resstr.substr(0,resstr.lastIndexOf(";"));
			}
			return resstr;
		}else{
			return this.http.getResponseHeader(key);
		}
	}else{return this.http.getAllResponseHeaders();}
};

/****************************************************
'@DESCRIPTION:	fetch response as xml document
'@PARAM:	charset [String] : text charset
'@RETURN:	[XMLDocument] return null when parse failed
'****************************************************/
MoLibHttpRequest.prototype.getxml=function(charset){
	if(!this.sended)this.send();
	if(this.readyState==-1)return null;
	try{
		var _dom = new ActiveXObject("MSXML2.DOMDocument");
		_dom.loadXML(this.gettext(charset));
		return _dom;
	}catch(ex){
		this.msg = ex.description;
		return null;	
	}
};

MoLibHttpRequest.prototype.getobj = function (){
	var b=null;
	var httplist = ["MSXML2.serverXMLHttp.3.0","MSXML2.serverXMLHttp","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp","Microsoft.XMLHttp"];
	for(var i = 0;i<=httplist.length -1;i++){
		try{
			b= new ActiveXObject(httplist[i]);
			(function(o){
				MoLibHttpRequest.prototype.getobj = function(){return new ActiveXObject(o)};  
			})(httplist[i]);
			return b;
		}catch(ex){
			//
		}
	}
	return b;
};

MoLibHttpRequest.prototype.getrnd = function (){return Math.random().toString().substr(2);};

MoLibHttpRequest.prototype.b2s = function(bytSource, Cset){ //ef bb bf,c0 fd
  var Objstream,c1,c2,c3;
  var byts;
  Objstream =Server.CreateObject("ADODB.Stream");
  Objstream.Type = 1;
  Objstream.Mode = 3;
  Objstream.Open();
  Objstream.Write(bytSource);
  Objstream.Position = 0;
  Objstream.Type = 2;
  Objstream.CharSet = Cset;
  byts = Objstream.ReadText();
  Objstream.Close();
  Objstream = null;
  return byts;
};
MoLibHttpRequest.prototype.urlencode=function(str){  return encodeURIComponent(str).replace(/\+/,"%2B");};
MoLibHttpRequest.prototype.urldecode=function(str){  return decodeURIComponent(str);};
MoLibHttpRequest.prototype.trim = function(src){src=src||"";return src.replace(/(^(\s+)|(\s+)$)/igm,"");};
if(!exports.http)exports.http={};
return exports.http.request = MoLibHttpRequest;