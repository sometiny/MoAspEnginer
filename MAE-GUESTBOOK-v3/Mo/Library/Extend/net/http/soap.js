/*
** File: soap.js
** Usage: soap request for webservices.
** About: 
**		support@mae.im
*/

var $b2s = function(bytSource, Cset){ //ef bb bf,c0 fd
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

var $getHttpResponse = function(WS,content){
	this.Request+=content;
	WS.send((content===undefined?null:content));
	this.Response = WS.responseBody;
	var result="";
	if(WS.readyState==4) result = $b2s(this.Response,this.Charset);
	WS = null;
	return result;
};
function _patchAttrs(e){
	var attrs = this.Attrs;
	if(!attrs) return;
	if(this.Protocol==3 || this.Protocol==4) return;
	var doc = new ActiveXObject("MSXML2.DOMDocument");
	doc.loadXML(e.Envelope);
	if(!doc.documentElement) return;
	for(var i in attrs){
		if(!attrs.hasOwnProperty(i)) continue;
		var node = doc.selectSingleNode(e.Path + i);
		if(node){
			for(var j in attrs[i]){
				if(!attrs[i].hasOwnProperty(j)) continue;
				node.setAttribute(j, attrs[i][j]);
			}
		}
	}
	return doc.xml;
}
function $soap(url,namespace){
	if(this.constructor!==$soap) return new $soap(url, namespace);
	function def(v){
		if(v==undefined)return "";
		return v;
	};
	this.Url = def(url);
	this.NameSpace = def(namespace);
	this.Protocol = $soap.Protocols.SOAP12;
	this.Charset="utf-8";
	this.SoapAction="";
	this.Request = "";
	this.Response = "";
	this.Location = "";
	this.Parms={};
	this.BeforeSend = [_patchAttrs];
	delete def;
}
SoapProtocols = $soap.Protocols = {"SOAP":1,"SOAP12":2,"HttpGet":3,"HttpPost":4};
$soap.ParseArguments = function(arg){
	var returnValue="";
	if(typeof arg=="object"){
		for(var i in arg){
			if(arg.hasOwnProperty(i)){
				var val = arg[i];
				if(val.constructor == Array){
					for(var j=0;j<val.length;j++){
						returnValue += "<" + i +">";
						returnValue += $soap.ParseArguments(val[j]) ;
						returnValue += "</" + i + ">";
					}
				}else{
					returnValue+="<" + i +">" + $soap.ParseArguments(val) + "</" + i + ">";
				}
			}
		}
		return returnValue;
	}
	return Server.HtmlEncode(arg);
};
$soap.ParseArgumentsForHttp = function(arg){
	var returnValue="";
	if(typeof arg=="object"){
		for(var i in arg){
			if(arg.hasOwnProperty(i)){
				var val = arg[i];
				returnValue+=i + "=" + Server.UrlEncode($soap.ParseArgumentsForHttp(val)) + "&";
			}
		}
		if(returnValue!="")returnValue = returnValue.substr(0,returnValue.length-1);
		return returnValue;
	}
	return arg;
};
$soap.fn = $soap.prototype;
$soap.fn.SetParm = function(value){
	this.Parms = value;
};
$soap.fn.SetProtocolVersion=function(version){
	if(version!=1 && version!=2 && version!=3 && version!=4)return;
	this.Protocol = version;
};
$soap.fn.SetSoapAction=function(soapAction){
	this.SoapAction = soapAction;
};
$soap.fn.SetCharset=function(charset){
	this.Charset = charset;
};
$soap.fn.ClearParms=function(){
	this.Parms={};
};
$soap.fn.Invoke=function(){
	if(arguments.length<=0)return;
	for(var i=1;i<arguments.length-1;i+=2){
		this.Parms[arguments[i]] = arguments[i+1];
	}
	if(this.Protocol==$soap.Protocols.HttpGet)return this.InvokeHttpGet.apply(this,arguments);
	if(this.Protocol==$soap.Protocols.HttpPost)return this.InvokeHttpPost.apply(this,arguments);
	if(this.Protocol==$soap.Protocols.SOAP)return this.InvokeSOAP.apply(this,[arguments[0]]);
	if(this.Protocol==$soap.Protocols.SOAP12)return this.InvokeSOAP12.apply(this,[arguments[0]]);
};

$soap.fn.InvokeSOAP12=function(func){
	this.Request="";
	var result="";
	var WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0");
	var Envelope ="";
	Envelope += "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
	Envelope += "<soap12:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">";
	Envelope += "<soap12:Body>";
	Envelope += "<" + func + " xmlns=\"" + this.NameSpace + "\">"
	Envelope += $soap.ParseArguments(this.Parms);
	Envelope += "</" + func + "></soap12:Body></soap12:Envelope>";
	WS.open("POST",this.Url,false);
	WS.setRequestHeader("Content-Length",Envelope.length);
	WS.setRequestHeader("Content-Type","application/soap+xml; charset=utf-8");
	for(var i=0;i<this.BeforeSend.length;i++){
		Envelope = this.BeforeSend[i].call(this, {Envelope : Envelope, Path : "//soap12:Envelope/soap12:Body/" + func}, WS) || Envelope;
	}
	return $getHttpResponse.call(this,WS,Envelope);
};

$soap.fn.InvokeSOAP=function(func){
	this.Request="";
	var result="",WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0"),Envelope ="",soapAction=this.NameSpace + func;
	if(this.SoapAction)soapAction = this.SoapAction;
	Envelope += "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
	Envelope += "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">";
	Envelope += "<soap:Body>";
	Envelope += "<" + func + " xmlns=\"" + this.NameSpace + "\">";
	Envelope += $soap.ParseArguments(this.Parms);
	Envelope += "</" + func + "></soap:Body></soap:Envelope>";
	WS.open("POST",this.Url,false);
	WS.setRequestHeader("Content-Length",Envelope.length);
	WS.setRequestHeader("Content-Type","text/xml; charset=utf-8");
	WS.setRequestHeader("SOAPAction","\""+soapAction+"\"");
	for(var i=0;i<this.BeforeSend.length;i++){
		Envelope = this.BeforeSend[i].call(this,  {Envelope : Envelope, Path : "//soap:Envelope/soap:Body/" + func}, WS) || Envelope;
	}
	return $getHttpResponse.call(this,WS,Envelope);
};

$soap.fn.InvokeHttpGet=function(){
	if(arguments.length<=0)return;
	this.Request="";
	var result="";
	var func = arguments[0];
	var WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0");
	var MyUrl = this.Url + "/" + func+ "?";
	if(this.Location!="")MyUrl = this.Url + this.Location + "?";
	var QString = $soap.ParseArgumentsForHttp(this.Parms);
	MyUrl += QString;
	if(QString=="")MyUrl = MyUrl.substr(0,MyUrl.length-1);
	WS.open("GET",MyUrl,false);
	for(var i=0;i<this.BeforeSend.length;i++){
		this.BeforeSend[i].call(this, null, WS);
	}
	return $getHttpResponse.call(this,WS,null);
};

$soap.fn.InvokeHttpPost=function(){
	if(arguments.length<=0)return;
	this.Request="";
	var func = arguments[0];
	var WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0");
	var MyUrl = this.Url + "/" + func;
	if(this.Location!="")MyUrl = this.Url + this.Location
	var QString = $soap.ParseArgumentsForHttp(this.Parms);
	WS.open("POST",MyUrl,false);
	WS.setRequestHeader("Content-Length",QString.length);
	WS.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	for(var i=0;i<this.BeforeSend.length;i++){
		QString = this.BeforeSend[i].call(this, {QString : QString}, WS) || QString;
	}
	return $getHttpResponse.call(this,WS,QString);
};
module.exports = $soap;