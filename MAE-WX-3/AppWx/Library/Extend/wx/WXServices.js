var httprequest = require("net/http/request");
function WXServices(appID,appsecret){
	this.Auth={
		"appID":appID,
		"appsecret":appsecret,
		"access_token":"",
		"expires_in":0
	};
	this.errmsg="";
	this.cachePerfix=((typeof MO_APP_NAME=="undefined")?"Mo":MO_APP_NAME);
	this.cachePerfix += "_" + F.session.int("Id",0);
}
WXServices.New = function(appID,appsecret){return new WXServices(appID,appsecret);};
WXServices.prototype.getqrcodeurl = function(tickets){
	return "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket="+F.encode(tickets);
}
WXServices.prototype.clearCache = function(){
	F.cache.enabled=true;
	F.cache.clear(this.cachePerfix + "_wx_access_token");
};
WXServices.prototype.parseerror = function(json){
	this.errmsg="";
	if(json!=null){
		if(json["errcode"] && json["errcode"]>0){
			this.errmsg = json["errmsg"];
			if(json["errcode"]==40001) {
				F.cache.enabled=true;
				F.cache.clear(this.cachePerfix + "_wx_access_token");
			}
		}else{
			json["error"]=false;
			return json;
		}
	}else{
		this.errmsg = "json data error";
	}
	return {"error":true};	
};
WXServices.prototype.getgroups = function(){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/groups/get?access_token=" + this.Auth.access_token).getjson("utf-8"));
};
WXServices.prototype.getusergroup = function(openid){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/groups/getid?access_token=" + this.Auth.access_token,
		"POST",
		F.format("{\"openid\":\"{0}\"}",openid)
	).getjson("utf-8"));
};
WXServices.prototype.updateusergroup = function(id,openid){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/groups/members/update?access_token=" + this.Auth.access_token,
		"POST",
		F.format("{\"openid\":\"{1}\",\"to_groupid\":{0}}",id,openid)
	).getjson("utf-8"));
};
WXServices.prototype.updategroup = function(id,name){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/groups/update?access_token=" + this.Auth.access_token,
		"POST",
		F.format("{\"group\":{\"id\":{0},\"name\":\"{1}\"}}",id,name)
	).getjson("utf-8"));
};
WXServices.prototype.creategroup = function(name){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/groups/create?access_token=" + this.Auth.access_token,
		"POST",
		F.format("{\"group\":{\"name\":\"{0}\"}}",name)
	).getjson("utf-8"));
};
WXServices.prototype.createqrcode = function(scene_id,expire_seconds){
	if(isNaN(scene_id)){
		this.errmsg = "scene_id must be a number";
		return {"error":true};
	} 
	expire_seconds = expire_seconds ||1800;
	if(isNaN(expire_seconds))expire_seconds=1800;
	if(expire_seconds>1800)expire_seconds=1800;
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + this.Auth.access_token,
		"POST",
		F.format("{\"expire_seconds\": {1}, \"action_name\": \"QR_SCENE\", \"action_info\": {\"scene\": {\"scene_id\": {0}}}}",scene_id,expire_seconds)
	).getjson("utf-8"));
};
WXServices.prototype.createlimitqrcode = function(scene_id){
	if(isNaN(scene_id)){
		this.errmsg = "scene_id must be a number";
		return {"error":true};
	}
	if(scene_id>100000){
		this.errmsg = "scene_id must be less than 100000.";
		return {"error":true};
	}
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + this.Auth.access_token,
		"POST",
		F.format("{\"action_name\": \"QR_LIMIT_SCENE\", \"action_info\": {\"scene\": {\"scene_id\": {0}}}}",scene_id)
	).getjson("utf-8"));
};
WXServices.prototype.getwxip = function(){
	return httprequest.create("https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=" + this.Auth.access_token).getjson("utf-8");
};
WXServices.prototype.getmenu = function(){
	return httprequest.create("https://api.weixin.qq.com/cgi-bin/menu/get?access_token=" + this.Auth.access_token).gettext("utf-8");
};
WXServices.prototype.createmenu = function(menu){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + this.Auth.access_token,"POST",menu).getjson("utf-8"));
};
WXServices.prototype.deletemenu = function(){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=" + this.Auth.access_token).getjson("utf-8"));
};
WXServices.prototype.downloadmedia = function(mediaid){
	var http = httprequest.create("http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=" + this.Auth.access_token + "&media_id=" + mediaid).send();
	var header = http.getheader("Content-disposition");
	if(header==""){
		return this.parseerror(http.getjson("utf-8"));
	}else{
		return this.parseerror({"error":false,"data":http.getbinary(),"contenttype":http.getheader("Content-Type"),"filename":header});
	}
};
WXServices.prototype.upload = function(type,path,contenttype){
	var Upload = require("net/http/upload");
	var httpupload = Upload("http://file.api.weixin.qq.com/cgi-bin/media/upload?access_token=" + this.Auth.access_token + "&type=" + type);
	httpupload.appendFile("media",path,contenttype);
	return this.parseerror(httpupload.send().getjson("utf-8"));
};
WXServices.prototype.getUser = function(openid,lang){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + this.Auth.access_token + "&openid="+(openid||"")+"&lang=" + (lang||"zh_CN")).getjson("utf-8"));
}

WXServices.prototype.getUsers = function(next){
	this.errmsg="";
	var json = httprequest.create("https://api.weixin.qq.com/cgi-bin/user/get?access_token=" + this.Auth.access_token + "&next_openid="+(next||"")).getjson("utf-8");
	if(json!=null){
		if(json["errcode"]){
			this.errmsg = json["errmsg"];
		}else{
			return {
				"error":false,
				"total" : json.total,
				"count" : json.count,
				"users" : json.data.openid.join(","),
				"next_openid" : json.next_openid
			};
		}
	}else{
		this.errmsg = "json data error";
	}
	return {"error":true};
};
WXServices.prototype.getAccessToken = function(){
	var access_token = F.cache.read(this.cachePerfix + "_wx_access_token");
	if(access_token!==null){
		var expires_in = F.cache.read(this.cachePerfix + "_wx_expires_in");
		if(expires_in!=null && !isNaN(expires_in)){
			if(F.timespan()<expires_in){
				this.Auth.access_token = access_token;
				this.Auth.expires_in = expires_in;
				return true;
			}
		}
	}
	var json = httprequest.create("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + this.Auth.appID + "&secret=" + this.Auth.appsecret + "").getjson("utf-8");
	if(json!=null){
		if(json["errcode"]){
			this.errmsg = json["errmsg"];
		}else{
			var cur = new Date();
			this.Auth.access_token = json["access_token"];
			this.Auth.expires_in = F.timespan(new Date(cur.getFullYear(),cur.getMonth(),cur.getDate(),cur.getHours(),cur.getMinutes(),cur.getSeconds() + json["expires_in"]));
			F.cache.enabled = true;
			F.cache.write(this.cachePerfix + "_wx_access_token",this.Auth.access_token);
			F.cache.write(this.cachePerfix + "_wx_expires_in",this.Auth.expires_in);
			F.cache.enabled = false;
			return true;
		}
	}else{
		this.errmsg = "json data error";
	}
	return false;
};
module.exports = WXServices;