var ws = require("./WXServices.js");
var httprequest = require("net/http/request");
function WXServicesKf(appID,appsecret){
	ws.apply(this,[appID,appsecret]);
	this.News={
		length:0,
		push:function(value){
			this[this.length++]=value;
		},
		clear:function(){
			while(this.length>0){
				this[--this.length]=null;
			}
		},
		append:function(title, content, url, pic){
			this.push({"title":title, "content":content, "pic":pic||"", "url":url||""});
		}
	};
}
WXServicesKf.prototype = new ws();
WXServicesKf.New = function(appID,appsecret){return new WXServicesKf(appID,appsecret);};

WXServicesKf.prototype.sendmessage = function(json){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=" + this.Auth.access_token,"POST",json).getjson("utf-8"));
};
WXServicesKf.prototype.sendtext = function(openid,content){
	return this.sendmessage(JSON.stringify({touser : openid, msgtype : "text",text : { content : content}}));
};
WXServicesKf.prototype.sendimage = function(openid,mediaid){
	return this.sendmessage(JSON.stringify({touser:openid,msgtype:"image",image:{media_id:mediaid}}));
};
WXServicesKf.prototype.sendvoice = function(openid,mediaid){
	return this.sendmessage(JSON.stringify({touser:openid,msgtype:"voice",voice:{media_id:mediaid}}));
};
WXServicesKf.prototype.sendvideo = function(openid,mediaid,title,description){
	return this.sendmessage(JSON.stringify({touser : openid, msgtype : "video",video :{media_id : mediaid,title : title||"",description : description || ""}}));
};
WXServicesKf.prototype.sendmusic = function(openid,mediaid,musicurl,title,description,hqmusicurl){
	if(hqmusicurl===undefined || hqmusicurl=="")hqmusicurl=musicurl;
	return this.sendmessage(JSON.stringify({touser : openid, msgtype : "music",music :{title : title||"",description : description || "",musicurl : musicurl,hqmusicurl : hqmusicurl,thumb_media_id : mediaid}}));
};
WXServicesKf.prototype.sendnews = function(openid){
	if(this.News.length<=0)return this.parseerror({"errcode":1,"errmsg":"no news to send"});
	var Json = {};
	Json.touser = openid;
	Json.msgtype = "news";
	Json.news = {articles:[]}
	for(var i=0;i<this.News.length;i++){
		Json.news.articles.push({
			"title" : this.News[i].title||"",
			"description" : this.News[i].content||"",
			"url" : this.News[i].url||"",
			"picurl" : this.News[i].pic||""
		});
	}
	return this.sendmessage(JSON.stringify(Json));
}
WXServicesKf.prototype.account = function(api, json){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/customservice/kfaccount/" + api + "?access_token=" + this.Auth.access_token,"POST",JSON.stringify(json)).getjson("utf-8"));
};
WXServicesKf.prototype.account_add = function(account, nick, password){
	return this.account("add", {"kf_account" : account,"nickname" : nick,"password" : MD5(password)});
};
WXServicesKf.prototype.account_update = function(account, nick, password){
	return this.account("update", {"kf_account" : account,"nickname" : nick,"password" : MD5(password)});
};
WXServicesKf.prototype.account_delete = function(account, nick, password){
	return this.account("del", {"kf_account" : account,"nickname" : nick,"password" : MD5(password)});
};
WXServicesKf.prototype.account_upload_headimg = function(account, path,contenttype){
	var Upload = require("net/http/upload");
	var httpupload = Upload("http://api.weixin.qq.com/customservice/kfaccount/uploadheadimg?access_token=" + this.Auth.access_token + "&kf_account=" + account);
	httpupload.appendFile("media",path,contenttype);
	return this.parseerror(httpupload.send().getjson("utf-8"));
};
WXServicesKf.prototype.account_get = function(){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/customservice/getkflist?access_token=" + this.Auth.access_token).getjson("utf-8"));
};
WXServicesKf.prototype.template_add = function(id){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/template/api_add_template?access_token=" + this.Auth.access_token, "POST", JSON.stringify({template_id_short:id})).getjson("utf-8"));
};
WXServicesKf.prototype.template_send = function(touser, templateid, url, data){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + this.Auth.access_token, "POST", JSON.stringify({touser:touser, template_id : templateid, url : url, data : data})).getjson("utf-8"));
};
WXServicesKf.prototype.template_get_new = function(){
	return {first:{value:"", color:"#000000"},keynote1:{value:"", color:"#000000"},keynote2:{value:"", color:"#000000"},keynote3:{value:"", color:"#000000"},remark:{value:"", color:"#000000"}};
};
module.exports = WXServicesKf;