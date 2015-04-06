var ws = require("./WXServices.js");
var httprequest = require("net/http/request");
function WXServicesMuti(appID,appsecret){
	ws.apply(this,[appID,appsecret]);
	this.sendto="group";
	this.filter="";
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
		append:function(thumb_media_id,title,content,content_source_url,author,digest){
			this.push({
				"thumb_media_id":thumb_media_id, 
				"title":title, 
				"content":content, 
				"content_source_url":content_source_url||"", 
				"author":author||"", 
				"digest":digest||""
			});
		}
	};
}
WXServicesMuti.prototype = new ws();
WXServicesMuti.New = function(appID,appsecret){return new WXServicesMuti(appID,appsecret);};
WXServicesMuti.prototype.createfilter = function(){
	if(this.sendto="group"){
		return "\"filter\":{\"group_id\":\"" + this.filter + "\"}";
	}else{
		return "\"touser\":[\"" + this.filter.replace(/\,/igm,"\",\"") + "\"]";
	}
};
WXServicesMuti.prototype.uploadnews = function(){
	if(this.News.length<=0)return this.parseerror({"errcode":1,"errmsg":"no news to upload"});
	var news=[];
	for(var i=0;i<this.News.length;i++){
		news.push(["{",
		"\"thumb_media_id\":\"" + this.News[i].thumb_media_id + "\",",
		"\"author\":\"" + this.News[i].author + "\",",
		"\"title\":\"" + this.News[i].title + "\",",
		"\"content_source_url\":\"" + this.News[i].content_source_url + "\",",
		"\"content\":\"" + this.News[i].content + "\",",
		"\"digest\":\"" + this.News[i].digest + "\"",
		"}"].join(""));
	}
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/media/uploadnews?access_token=" + this.Auth.access_token,
		"POST",
		F.format("{\"articles\":[{0}]}",news.join(","))
	).getjson("utf-8"));
};
WXServicesMuti.prototype.uploadvideo = function(mediaid,title,description){
	return this.parseerror(httprequest.create(
		"https://api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token=" + this.Auth.access_token,
		"POST",
		F.format("{\"media_id\":\"{0}\",\"title\":\"{1}\",\"description\":\"{2}\"}",mediaid,F.jsEncode(title||""),F.jsEncode(description||""))
	).getjson("utf-8"));
};
WXServicesMuti.prototype.sendmessage = function(json){
	return this.parseerror(httprequest.create("https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token=" + this.Auth.access_token,"POST",json).getjson("utf-8"));
};
WXServicesMuti.prototype.sendnews = function(mediaid){
	return this.sendmessage(F.format("{" + this.createfilter() + ",\"mpnews\":{\"media_id\":\"{0}\"},\"msgtype\":\"mpnews\"}",mediaid));
};
WXServicesMuti.prototype.sendtext = function(content){
	return this.sendmessage(F.format("{" + this.createfilter() + ",\"text\":{\"content\":\"{0}\"},\"msgtype\":\"text\"}",content));
};
WXServicesMuti.prototype.sendvoice= function(mediaid){
	return this.sendmessage(F.format("{" + this.createfilter() + ",\"voice\":{\"media_id\":\"{0}\"},\"msgtype\":\"voice\"}",mediaid));
};
WXServicesMuti.prototype.sendimage= function(mediaid){
	return this.sendmessage(F.format("{" + this.createfilter() + ",\"image\":{\"media_id\":\"{0}\"},\"msgtype\":\"image\"}",mediaid));
};
WXServicesMuti.prototype.sendvideo= function(mediaid,title,description){
	if(this.sendto=="group"){
		return this.sendmessage(F.format("{" + this.createfilter() + ",\"mpvideo\":{\"media_id\":\"{0}\"},\"msgtype\":\"mpvideo\"}",mediaid));
	}else{
		return this.sendmessage(F.format("{" + this.createfilter() + ",\"video\":{\"media_id\":\"{0}\",\"title\":\"{1}\",\"description\":\"{2}\"},\"msgtype\":\"video\"}",mediaid,title||"",description||""));
	}
};
WXServicesMuti.prototype.deletemsg = function(msgid){
	return this.parseerror(httprequest.create(
	"https://api.weixin.qq.com/cgi-bin/message/mass/delete?access_token=" + this.Auth.access_token,
	"POST",
	"{\"msgid\":" + msgid + "}").getjson("utf-8"));	
};
module.exports = WXServicesMuti;