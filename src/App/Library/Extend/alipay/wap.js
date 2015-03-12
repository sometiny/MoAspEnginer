if(!exports.alipay)exports.alipay={};
if(exports.alipay.wap)return;

function get_reg_data(src){
	var returnValue="<direct_trade_create_req>";
	F.foreach(src,function(key, value){
		if(value=="")return;
		returnValue += "<" + key + ">" + value.replace(/&/igm,"&amp;") + "</" + key + ">";
	});
	return returnValue+"</direct_trade_create_req>";
}

function get_pendding_sign_data(src,charset){
	var returnValue="";
	F.foreach(src,function(key, value){
		if(value=="")return;
		returnValue += key + "=" + (charset ? F.exports.encoding.encodeURIComponent(value,charset) : value) + "&";
	});
	if(returnValue!="")returnValue=returnValue.substr(0,returnValue.length-1);
	return returnValue;
}

function xml2json(src,root){
	var node = F.activex("MSXML2.DOMDocument",function(text){
		this.loadXML(text);
		return this.documentElement||null;
	}, src);
	if(node!=null){
		var children = node.childNodes;
		var o={};
		for(var i=0;i<children.length;i++){
			o[children[i].nodeName] = children[i].text;
		}
		return o;
	}
	return {};
};
function hex2base64(src){
	return F.base64.e(F.exports.encoding.hex.parse(src));
}
function base642hex(src){
	return F.exports.encoding.hex.stringify(F.base64.d(src));
}
var $alipay = IClass.create(function(charset, partner, key){
	this.rest_url = "https://wappaygw.alipay.com/service/rest.htm";
	this.key = key || "";
	this.token = "";
	this.config = {};
	this.config.service = "alipay.wap.trade.create.direct";
	this.config.format = "xml";
	this.config.v = "2.0";
	this.config.partner = partner || "";
	this.config.sec_id = "MD5";
	this.config._input_charset = charset || "utf-8";
	this.data = {};
	this.exception = "";
	this.redirect_url = "";
	F.require("encoding");
	F.require("net/http/request");
}); 
$alipay.extend("clear",function(){ this.data={};});
$alipay.extend("set",function(key, value){ this.data[key]=value;});

/*异步通知处理方法*/
$alipay.extend("notify",function(){
	if(F.get("sign") == F.md5_bytes(
		F.exports.encoding[this.config._input_charset=="utf-8"?"utf8":"gbk"].getByteArray(
			F.format("service={0}&v={1}&sec_id={2}&notify_data={3}{4}","alipay.wap.trade.create.direct","1.0",F.post("sec_id"),F.post("notify_data"),this.key)
		))
	){
		var data = xml2json(F.post("notify_data").replace(/\+/igm," "),"notify");
		if(data.hasOwnProperty("out_trade_no")){
			data.err=false;
		}else{
			this.exception = "data-error";
			data.err=true;
		}
		return data;
	}else{
		this.exception = "callback-sign-error";
		return {err:true};
	}
});

/*同步通知处理方法*/
$alipay.extend("callback",function(){
	var data = {"result" : F.get("result"), "out_trade_no" : F.get("out_trade_no"), "trade_no" : F.get("trade_no"), "request_token" : F.get("request_token")};
	if(F.get("sign") == F.md5_bytes(
		F.exports.encoding[this.config._input_charset=="utf-8"?"utf8":"gbk"].getByteArray(
			get_pendding_sign_data(F.object.sort(data)) + this.key
		))
	){
		data["err"] = false;
		return data;
	}else{
		this.exception = "callback-sign-error";
		return {"err":true};
	}
});

/*获取跳转URL*/
$alipay.extend("get_redirect_url",function(token){
	token = token || this.get_token();
	if(token==""){
		return false;
	}else{
		this.token=token;
		this.config.service = "alipay.wap.auth.authAndExecute";
		var parms = F.object.sort(
			F.extend(
				{},
				this.config, 
				{
					req_id : F.guid("N"), 
					req_data : "<auth_and_execute_req><request_token>" + token + "</request_token></auth_and_execute_req>"
				}
			)
		);
		parms.sign = F.md5_bytes(
			F.exports.encoding[this.config._input_charset=="utf-8"?"utf8":"gbk"].getByteArray(
				get_pendding_sign_data(parms)+this.key
			)
		);
		var url = this.rest_url + "?" + get_pendding_sign_data(
			parms, 
			this.config._input_charset
		);
		this.redirect_url = url;
		return true;
	}
});

/*获取request_token*/
$alipay.extend("get_token",function(){
	this.config.service = "alipay.wap.trade.create.direct";
	var parms = F.object.sort(
		F.extend(
			{},
			this.config, 
			{
				req_id : F.guid("N"), 
				req_data : get_reg_data(this.data)
			}
		)
	);
	parms.sign = F.md5_bytes(
		F.exports.encoding[this.config._input_charset=="utf-8"?"utf8":"gbk"].getByteArray(
			get_pendding_sign_data(parms)+this.key
		)
	);
	var text = F.exports.net.http.request.create(
		this.rest_url,
		{
			method : "POST", 
			data : get_pendding_sign_data(
				parms, 
				this.config._input_charset
			)
		}
	).gettext();
	var data = F.object.fromURIString(text);
	if(data["res_error"]){
		var error_info = xml2json(
			data["res_error"].replace(/\+/igm," "),
			"err"
		);
		this.exception = error_info.msg + ":" + error_info.detail;
	}else{
		var sign = data["sign"];
		data.sign="";
		data.res_data = data.res_data.replace(/\+/igm," ");
		if(sign == F.md5_bytes(
			F.exports.encoding[this.config._input_charset=="utf-8"?"utf8":"gbk"].getByteArray(
				get_pendding_sign_data(F.object.sort(data))+this.key
			))
		){
			var token = xml2json(data["res_data"].replace(/\+/igm," "),"direct_trade_create_res")["request_token"];
			return token || "";
		}else{
			this.exception = "sign-error"
		}
	}
	return "";
});
$alipay.create = function(charset, partner, key){ return new $alipay(charset, partner, key);}
return exports.alipay.wap = $alipay;