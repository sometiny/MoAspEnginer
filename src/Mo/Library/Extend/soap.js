/****************************************************
'@DESCRIPTION:	define MoLibSoap object
'****************************************************/
function MoLibSoap(url,namespace){
	function def(v){
		if(v==undefined)return "";
		return v;
	};
	this.Url = def(url);
	this.NameSpace = def(namespace);
	this.Protocol = MoLibSoap.Protocols.SOAP12;
	this.Charset="utf-8";
	this.SoapAction="";
	this.Request = "";
	this.Response = "";
	this.Location = "";
	this.Parms={};
	delete def;
}

MoLibSoap.ParmsManager = function(Src){
	if(Src!=undefined) this.Parms = Src.Parms;
	else this.Parms={};
};
MoLibSoap.ParmsManager.prototype.Push = function(path, value){
	(new Function("value","this.Parms"+MoLibSoap.ParsePath(path)+"=value;")).apply(this,[value]);
};

MoLibSoap.ParmsManager.prototype.PushAsObject = function(path){
	(new Function("this.Parms"+MoLibSoap.ParsePath(path)+"={};")).apply(this,[]);
};

MoLibSoap.ParmsManager.prototype.PushAsArray = function(path){
	(new Function("this.Parms"+MoLibSoap.ParsePath(path)+"=[];")).apply(this,[]);
};

MoLibSoap.ParmsManager.prototype.PushVBArray = function(path, value){
	(new Function("value","this.Parms"+MoLibSoap.ParsePath(path)+"=(new VBArray(value)).toArray();")).apply(this,[value]);
};
MoLibSoap.ParsePath = function(path){
	if(/([^\w\.\[\]]+)/.test(path)){
		throw {"description":"path error"};
		return;
	}
	return path.replace(/\b([a-zA-Z]\w*)\b/igm,"[\"$1\"]").replace(/\./igm,"");
};
MoLibSoap.Protocols = {"SOAP":1,"SOAP12":2,"HttpGet":3,"HttpPost":4};
MoLibSoap.ParseArguments = function(arg){
	var returnValue="";
	if(typeof arg=="object"){
		for(var i in arg){
			if(arg.hasOwnProperty(i)){
				var val = arg[i];
				if(val.constructor == Array){
					for(var j=0;j<val.length;j++){
						returnValue+="<" + i + ">" + MoLibSoap.ParseArguments(val[j]) + "</" + i + ">";
					}
				}else{
					returnValue+="<" + i + ">" + MoLibSoap.ParseArguments(val) + "</" + i + ">";
				}
			}
		}
		return returnValue;
	}
	return Server.HtmlEncode(arg);
};
MoLibSoap.ParseArgumentsForHttp = function(arg){
	var returnValue="";
	if(typeof arg=="object"){
		for(var i in arg){
			if(arg.hasOwnProperty(i)){
				var val = arg[i];
				returnValue+=i + "=" + Server.UrlEncode(MoLibSoap.ParseArgumentsForHttp(val)) + "&";
			}
		}
		if(returnValue!="")returnValue = returnValue.substr(0,returnValue.length-1);
		return returnValue;
	}
	return arg;
};
MoLibSoap.prototype = new MoLibSoap.ParmsManager();
MoLibSoap.New = MoLibSoap.prototype.New = function(url,namespace){
	return new MoLibSoap(url,namespace);	
};
MoLibSoap.prototype.CreateParmsManager=function(){
	return new MoLibSoap.ParmsManager(this);
};
MoLibSoap.prototype.SetParm = function(path,value){
	(new Function("value","this.Parms"+MoLibSoap.ParsePath(path)+"=value;")).apply(this,[value]);
};
MoLibSoap.prototype.SetProtocolVersion=function(version){
	if(version!=1 && version!=2 && version!=3 && version!=4)return;
	this.Protocol = version;
};
MoLibSoap.prototype.SetSoapAction=function(soapAction){
	this.SoapAction = soapAction;
};
MoLibSoap.prototype.SetCharset=function(charset){
	this.Charset = charset;
};
MoLibSoap.prototype.ClearParms=function(){
	this.Parms={};
};
MoLibSoap.prototype.Invoke=function(){
	if(arguments.length<=0)return;
	for(var i=1;i<arguments.length-1;i+=2){
		this.Parms[arguments[i]] = arguments[i+1];
	}
	if(this.Protocol==MoLibSoap.Protocols.HttpGet)return this.InvokeHttpGet.apply(this,arguments);
	if(this.Protocol==MoLibSoap.Protocols.HttpPost)return this.InvokeHttpPost.apply(this,arguments);
	if(this.Protocol==MoLibSoap.Protocols.SOAP)return this.InvokeSOAP.apply(this,[arguments[0]]);
	if(this.Protocol==MoLibSoap.Protocols.SOAP12)return this.InvokeSOAP12.apply(this,[arguments[0]]);
};

MoLibSoap.prototype.InvokeSOAP12=function(func){
	this.Request="";
	var result="";
	var WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0");
	var Envelope ="";
	Envelope += "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
	Envelope += "<soap12:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">";
	Envelope += "<soap12:Body>";
	Envelope += "<" + func + " xmlns=\"" + this.NameSpace + "\">"
	Envelope += MoLibSoap.ParseArguments(this.Parms);
	Envelope += "</" + func + "></soap12:Body></soap12:Envelope>";
	WS.open("POST",this.Url,false);
	WS.setRequestHeader("Content-Length",Envelope.length);
	WS.setRequestHeader("Content-Type","application/soap+xml; charset=utf-8");
	return this.GetHttpResponse(WS,Envelope);
};

MoLibSoap.prototype.InvokeSOAP=function(func){
	this.Request="";
	var result="",WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0"),Envelope ="",soapAction=this.NameSpace + func;
	if(this.SoapAction)soapAction = this.SoapAction;
	Envelope += "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
	Envelope += "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">";
	Envelope += "<soap:Body>";
	Envelope += "<" + func + " xmlns=\"" + this.NameSpace + "\">";
	Envelope += MoLibSoap.ParseArguments(this.Parms);
	Envelope += "</" + func + "></soap:Body></soap:Envelope>";
	WS.open("POST",this.Url,false);
	WS.setRequestHeader("Content-Length",Envelope.length);
	WS.setRequestHeader("Content-Type","text/xml; charset=utf-8");
	WS.setRequestHeader("SOAPAction","\""+soapAction+"\"");
	return this.GetHttpResponse(WS,Envelope);
};

MoLibSoap.prototype.InvokeHttpGet=function(){
	if(arguments.length<=0)return;
	this.Request="";
	var result="";
	var func = arguments[0];
	var WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0");
	var MyUrl = this.Url + "/" + func+ "?";
	if(this.Location!="")MyUrl = this.Url + this.Location + "?";
	var QString = MoLibSoap.ParseArgumentsForHttp(this.Parms);
	MyUrl += QString;
	if(QString=="")MyUrl = MyUrl.substr(0,MyUrl.length-1);
	WS.open("GET",MyUrl,false);
	return this.GetHttpResponse(WS,null);
};

MoLibSoap.prototype.InvokeHttpPost=function(){
	if(arguments.length<=0)return;
	this.Request="";
	var func = arguments[0];
	var WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0");
	var MyUrl = this.Url + "/" + func;
	if(this.Location!="")MyUrl = this.Url + this.Location
	var QString = MoLibSoap.ParseArgumentsForHttp(this.Parms);
	WS.open("POST",MyUrl,false);
	WS.setRequestHeader("Content-Length",QString.length);
	WS.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	return this.GetHttpResponse(WS,QString);
};

MoLibSoap.prototype.GetHttpResponse = function(WS,content){
	this.Request+=content;
	WS.send((content===undefined?null:content));
	this.Response = WS.responseBody;
	var result="";
	if(WS.readyState==4) result = this.b2s(this.Response,this.Charset);
	WS = null;
	return result;
};
MoLibSoap.prototype.b2s = function(bytSource, Cset){ //ef bb bf,c0 fd
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
return exports.soap = MoLibSoap;