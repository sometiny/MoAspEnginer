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
			if(json["errcode"]==40001) {
				F.cache.enabled=true;
				F.cache.clear(this.cachePerfix + "_wx_access_token");
			}
			json["error"]=true;
		}else{
			json["error"]=false;
		}
		return json;
	}else{
		return {"error":true, errmsg : "json data error"};	
	}
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
		JSON.stringify({group:{id:id,name:name}})
	).getjson("utf-8"));
};
WXServices.prototype.creategroup = function(name){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/groups/create?access_token=" + this.Auth.access_token,
		"POST",
		JSON.stringify({group:{name:name}})
	).getjson("utf-8"));
};
WXServices.prototype.deletegroup = function(id){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/groups/delete?access_token=" + this.Auth.access_token,
		"POST",
		JSON.stringify({group:{id:id}})
	).getjson("utf-8"));
};
WXServices.prototype.createqrcode = function(scene_id,expire_seconds){
	if(isNaN(scene_id)){
		this.errmsg = "scene_id must be a number";
		return {"error":true};
	} 
	expire_seconds = expire_seconds ||1800;
	if(isNaN(expire_seconds))expire_seconds=1800;
	if(expire_seconds>604800)expire_seconds=604800;
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + this.Auth.access_token,
		"POST",
		JSON.stringify({"expire_seconds": expire_seconds, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": scene_id}}})
	).getjson("utf-8"));
};
WXServices.prototype.createlimitqrcode = function(scene_id,scene_str){
	if(isNaN(scene_id)){
		this.errmsg = "scene_id must be a number";
		return {"error":true};
	}
	if(scene_id>100000){
		this.errmsg = "scene_id must be less than 100000.";
		return {"error":true};
	}
	var data = {"action_name": "QR_LIMIT_SCENE", "action_info": {"scene": {}}};
	if(scene_id) data.action_info.scene["scene_id"] = scene_id;
	if(scene_str) {
		data["action_name"] = "QR_LIMIT_STR_SCENE";
		data.action_info.scene["scene_str"] = scene_str;
	}
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + this.Auth.access_token,
		"POST",
		JSON.stringify(data)
	).getjson("utf-8"));
};
WXServices.prototype.get_short_url = function(url){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/shorturl?access_token=" + this.Auth.access_token,"POST",JSON.stringify({action:'long2short', long_url : url})).getjson("utf-8"));
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
/*temp*/
WXServices.prototype.download = function(mediaid, isvideo){
	var http = httprequest.create((isvideo===true ? "http://" : "https://") + "api.weixin.qq.com/cgi-bin/media/get?access_token=" + this.Auth.access_token + "&media_id=" + mediaid).send();
	var header = http.getheader("Content-disposition");
	if(header==""){
		return this.parseerror(http.getjson("utf-8"));
	}else{
		return this.parseerror({"error":false,"data":http.getbinary(),"contenttype":http.getheader("Content-Type"),"filename":header});
	}
};
WXServices.prototype.upload = function(type,path,contenttype){
	var Upload = require("net/http/upload");
	var httpupload = Upload("https://api.weixin.qq.com/cgi-bin/media/upload?access_token=" + this.Auth.access_token + "&type=" + type);
	httpupload.appendFile("media",path,contenttype);
	return this.parseerror(httpupload.send().getjson("utf-8"));
};

/*material*/
WXServices.prototype.upload_image = function(path,contenttype){
	var Upload = require("net/http/upload");
	var httpupload = Upload("https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=" + this.Auth.access_token);
	httpupload.appendFile("media", path, contenttype);
	return this.parseerror(httpupload.send().getjson("utf-8"));
};
WXServices.prototype.upload_media = function(type,path,contenttype, description){
	var Upload = require("net/http/upload");
	var httpupload = Upload("https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=" + this.Auth.access_token);
	httpupload.appendFile("media", path, contenttype);
	httpupload.appendForm("type", type);
	if(description) httpupload.appendForm("description", JSON.stringify(description));
	return this.parseerror(httpupload.send().getjson("utf-8"));
};
WXServices.prototype.upload_news = function(title, digest, content, author, thumb_media_id, content_source_url, show_cover_pic){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=" + this.Auth.access_token,
		"POST",
		JSON.stringify(typeof title=="string" ? {articles : [{title : title,thumb_media_id : thumb_media_id,author : author,digest : digest,show_cover_pic : show_cover_pic===false ? "0" : "1",content : content,content_source_url : content_source_url}]} : title)
	).getjson("utf-8"));
};
WXServices.prototype.get_media_count = function(){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=" + this.Auth.access_token).getjson("utf-8"));
};
WXServices.prototype.get_media_list = function(type, offset, count){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=" + this.Auth.access_token,
		"POST",
		JSON.stringify({type : type, offset : offset, count : count})
	).getjson("utf-8"));
};
WXServices.prototype.download_media = function(mediaid, type){
	var http = httprequest.create("https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=" + this.Auth.access_token,"POST",JSON.stringify({media_id:mediaid})).send();
	if(type == "news" || type == "video"){
		return this.parseerror(http.getjson("utf-8"));
	}else{
		return this.parseerror({"error":false,"data":http.getbinary(),"contenttype":http.getheader("Content-Type"),"filename":header});
	}
};
WXServices.prototype.delete_media = function(mediaid){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/material/del_material?access_token=" + this.Auth.access_token,
		"POST",
		JSON.stringify({media_id:mediaid})
	).getjson("utf-8"));
};
WXServices.prototype.update_news = function(mediaid, index, title, digest, content, author, thumb_media_id, content_source_url, show_cover_pic){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=" + this.Auth.access_token,
		"POST",
		JSON.stringify({media_id : mediaid, index : index, articles : {
			title : title,
			thumb_media_id : thumb_media_id,
			author : author,
			digest : digest,
			show_cover_pic : show_cover_pic===false ? "0" : "1",
			content : content,
			content_source_url : content_source_url
		}})
	).getjson("utf-8"));
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