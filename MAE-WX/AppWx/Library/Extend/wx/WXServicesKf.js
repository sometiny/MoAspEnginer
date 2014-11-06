F.require("wx/WXServices");
function WXServicesKf(appID,appsecret){
	F.exports.WXServices.apply(this,[appID,appsecret]);
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
WXServicesKf.prototype = new F.exports.WXServices();
WXServicesKf.New = function(appID,appsecret){return new WXServicesKf(appID,appsecret);};

WXServicesKf.prototype.sendmessage = function(json){
	return this.parseerror(F.exports.net.http.request.create("https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=" + this.Auth.access_token,"POST",json).getjson("utf-8"));
};
WXServicesKf.prototype.sendtext = function(openid,content){
	JSON.encode=false;
	return this.sendmessage(JSON.stringify({touser : openid, msgtype : "text",text : { content : content}}));
};
WXServicesKf.prototype.sendimage = function(openid,mediaid){
	return this.sendmessage(F.format("{\"touser\":\"{0}\",\"msgtype\":\"image\",\"image\":{\"media_id\":\"{1}\"}}",openid,mediaid));
};
WXServicesKf.prototype.sendvoice = function(openid,mediaid){
	return this.sendmessage(F.format("{\"touser\":\"{0}\",\"msgtype\":\"voice\",\"voice\":{\"media_id\":\"{1}\"}}",openid,mediaid));
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
return exports.WXServicesKf = WXServicesKf;