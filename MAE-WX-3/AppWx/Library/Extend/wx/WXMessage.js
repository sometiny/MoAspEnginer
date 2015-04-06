var SHA1 = require("sha1").SHA1;
var httprequest = require("net/http/request");
var Encoding = require("encoding");
var CryptoJS = require("CryptoJS");
var WXConf = Mo.C("@.WX");
function WXMessage(){
	this.SignManager={
		token:"",
		timestamp:"",
		nonce:"",
		comparewith:function(signature){
			F.sortable.clear();
			F.sortable.add(this.timestamp);
			F.sortable.add(this.nonce);
			F.sortable.add(this.token);
			F.sortable.sort(true);
			return SHA1(F.sortable.join())==signature;
		}
	};
	this.News={
		length:0,
		push:function(value){
			if(typeof value !="object"){
				this.append.apply(this,arguments);
				return;
			}
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
	this.MsgType="";
	this.ToUserName="";
	this.FromUserName="";
	this.CreateTime="";
	this.MsgId="";
	this.Request={};
	this.Message = "";
	this.Reply = "";
	this.Exception = "";
	this.AppID="";
	this.EncryptType = "";
	this.Ori={Message:"",Reply:""};
	this.MessageLength=0;
	this.IgnoreCrypt = false;
	this.Random=[];
	this.Padding = {
		pad: function(F, D) {
			var E = 8 * 4;
			var H = E - F.sigBytes % E;
			var A = (H << 24) | (H << 16) | (H << 8) | H;
			var C = [];
			for (var B = 0; B < H; B += 4) {
				C.push(A)
			}
			var G = CryptoJS.lib.WordArray.create(C, H);
			F.concat(G)
		},
		unpad: function(A) {
			var B = A.words[(A.sigBytes - 1) >>> 2] & 255;
			A.sigBytes -= B
		}
	};
}
WXMessage.New = function(){return new WXMessage();};
WXMessage.timespan = function(){
	var df = (new Date())-(new Date(1970,0,1));
	return (df-(df%1000))/1000-3600*8;
};
WXMessage.prototype.basic = function(){
	return {
		"MsgType":this.MsgType,
		"ToUserName":this.ToUserName,
		"FromUserName":this.FromUserName,
		"CreateTime":this.CreateTime,
		"MsgId":this.MsgId,
		"Request":this.Request
	}
};
WXMessage.prototype.encrypt = function(){
	var key_byte = base64.d(WXConf.aeskey+"=");
	CryptoJS.require.AES().Format.Hex();
	this.Ori.Reply = this.Reply;
	var src = Encoding.utf8.getByteArray(this.Reply);
	this.MessageLength = src.length;
	var data = [];
	for(var i=0;i<16;i++) data.push(parseInt(Math.random()*125)+64);
	data = data.concat(CryptoJS.enc.BitConverter.FromInt32(this.MessageLength)).concat(src).concat(Encoding.utf8.getByteArray(this.AppID));
	var msg_encrypt = CryptoJS.AES.encrypt(
		CryptoJS.enc.BitConverter.ToWordArray(data),
		CryptoJS.enc.BitConverter.ToWordArray(key_byte),
		{ 
	    	iv: CryptoJS.enc.BitConverter.ToWordArray(key_byte.slice(0,16)),
		    padding:this.Padding
    	}
    ).toString();
    var timestamp = F.timespan(), nonce = timestamp + parseInt(Math.random()*256+256) * (parseInt(Math.random()*10)-5);
	F.sortable.clear();
	F.sortable.add(timestamp + "");
	F.sortable.add(nonce + "");
	F.sortable.add(this.SignManager.token);
	F.sortable.add(msg_encrypt);
	F.sortable.sort(true);
	var signature = SHA1(F.sortable.join());
	this.Reply = F.format("<xml><Encrypt><![CDATA[{0}]]></Encrypt><MsgSignature><![CDATA[{1}]]></MsgSignature><TimeStamp><![CDATA[{2}]]></TimeStamp><Nonce><![CDATA[{3}]]></Nonce></xml>",msg_encrypt,signature,timestamp,nonce);
};
WXMessage.prototype.decrypt = function(msg_encrypt,msg_signature){
	F.sortable.clear();
	F.sortable.add(this.SignManager.timestamp);
	F.sortable.add(this.SignManager.nonce);
	F.sortable.add(this.SignManager.token);
	F.sortable.add(msg_encrypt);
	F.sortable.sort(true);
	if(SHA1(F.sortable.join())!=msg_signature){
		this.Exception = "msg_signature verify failed.";
		return false;
	}
	var key_byte = base64.d(WXConf.aeskey+"=");
	CryptoJS.require.AES().Format.Hex();
	var result_byte=CryptoJS.enc.BitConverter.FromWordArray(
		CryptoJS.AES.decrypt(
			CryptoJS.lib.CipherParams.create(
				{
					ciphertext: CryptoJS.enc.Hex.parse(
						Encoding.hex.stringify(
							base64.d(msg_encrypt)
						)
					),
					blockSize:8
				}
			), 
			CryptoJS.enc.BitConverter.ToWordArray(key_byte),
			{ 
		    	iv: CryptoJS.enc.BitConverter.ToWordArray(key_byte.slice(0,16)),
		    	format:CryptoJS.format.Hex,
		    	padding:this.Padding
	    	}
	    )
	);
	this.MessageLength = CryptoJS.enc.BitConverter.ToInt32(result_byte,16);
	this.Ori.Message = this.Message;
	this.Random = result_byte.slice(0,16);
	this.Message = Encoding.utf8.toString(Encoding.utf8.bytesToWords(result_byte.slice(20,20+this.MessageLength)));
	this.AppID = Encoding.utf8.toString(Encoding.utf8.bytesToWords(result_byte.slice(20+this.MessageLength)));
	return true;
};
WXMessage.prototype.loadRequest = function(requeststr){
	this.Message = requeststr;
	var XML = require("xml");
	var xml = XML.Load(requeststr)
	if(xml.ROOT==null)return false;
	if(F.get("encrypt_type")=="aes" && !this.IgnoreCrypt){
		if(!this.decrypt(xml.select("Encrypt").text(),F.get("msg_signature"))) return false;
		xml = XML.Load(this.Message);
		if(xml.ROOT==null){
			this.Exception = "xml document error";
			return false;
		}
		this.EncryptType = "aes";
	}else{
		if(!this.SignManager.comparewith(F.get("signature"))){
			this.Exception = "signature verify failed.";
			return false;
		}
	}
	this.MsgType = xml.select("MsgType").text().toLowerCase();
	if(this.MsgType==""){
		this.Exception = "can not find 'MsgType' node";
		return false;
	}
	this.ToUserName = xml.select("ToUserName").text();
	this.FromUserName = xml.select("FromUserName").text();
	this.CreateTime = xml.select("CreateTime").text();
	if(this.MsgType!="event")this.MsgId = xml.select("MsgId").text();
	else{
		this.Request["Event"] = xml.select("Event").text();
		//subscribe,unsubscribe,SCAN,LOCATION,CLICK,VIEW,MASSSENDJOBFINISH
		if(this.Request["Event"]=="LOCATION"){
			this.Request["Latitude"] = xml.select("Latitude").text();
			this.Request["Longitude"] = xml.select("Longitude").text();
			this.Request["Precision"] = xml.select("Precision").text();
		}else if(this.Request["Event"]=="MASSSENDJOBFINISH"){
			this.Request["MsgID"] = xml.select("MsgID").text();
			this.Request["Status"] = xml.select("Status").text();
			this.Request["TotalCount"] = xml.select("TotalCount").text();
			this.Request["FilterCount"] = xml.select("FilterCount").text();
			this.Request["SentCount"] = xml.select("SentCount").text();
			this.Request["ErrorCount"] = xml.select("ErrorCount").text();
		}else{
			this.Request["EventKey"] = xml.select("EventKey").text();
			this.Request["Ticket"] = xml.select("Ticket").text();
		}
	}
	if(this.MsgType=="text"){
		this.Request["Content"] = xml.select("Content").text();
	}else if(this.MsgType=="image"){
		this.Request["PicUrl"] = xml.select("PicUrl").text();
		this.Request["MediaId"] = xml.select("MediaId").text();
	}else if(this.MsgType=="voice"){
		this.Request["Format"] = xml.select("Format").text();
		this.Request["MediaId"] = xml.select("MediaId").text();
		this.Request["Recognition"] = xml.select("Recognition").text();
	}else if(this.MsgType=="video"){
		this.Request["ThumbMediaId"] = xml.select("ThumbMediaId").text();
		this.Request["MediaId"] = xml.select("MediaId").text();
	}else if(this.MsgType=="location"){
		this.Request["Location_X"] = xml.select("Location_X").text();
		this.Request["Location_Y"] = xml.select("Location_Y").text();
		this.Request["Scale"] = xml.select("Scale").text();
		this.Request["Label"] = xml.select("Label").text();
	}else if(this.MsgType=="link"){
		this.Request["Title"] = xml.select("Title").text();
		this.Request["Description"] = xml.select("Description").text();
		this.Request["Url"] = xml.select("Url").text();
	}
	xml = null;
	return true
};
WXMessage.prototype.createTextResponse = function(content){
	return ["<xml>",
	"<ToUserName><![CDATA[" + this.FromUserName + "]]></ToUserName>",
	"<FromUserName><![CDATA[" + this.ToUserName + "]]></FromUserName>",
	"<CreateTime>" + WXMessage.timespan() + "</CreateTime>",
	"<MsgType><![CDATA[text]]></MsgType>",
	"<Content><![CDATA[" + content + "]]></Content>",
	"</xml>"].join("");
};
WXMessage.prototype.createImageResponse = function(mediaid){
	return ["<xml>",
	"<ToUserName><![CDATA[" + this.FromUserName + "]]></ToUserName>",
	"<FromUserName><![CDATA[" + this.ToUserName + "]]></FromUserName>",
	"<CreateTime>" + WXMessage.timespan() + "</CreateTime>",
	"<MsgType><![CDATA[image]]></MsgType>",
	"<Image><MediaId><![CDATA[" + mediaid + "]]></MediaId></Image>",
	"</xml>"].join("");
};
WXMessage.prototype.createVoiceResponse = function(mediaid){
	return ["<xml>",
	"<ToUserName><![CDATA[" + this.FromUserName + "]]></ToUserName>",
	"<FromUserName><![CDATA[" + this.ToUserName + "]]></FromUserName>",
	"<CreateTime>" + WXMessage.timespan() + "</CreateTime>",
	"<MsgType><![CDATA[voice]]></MsgType>",
	"<Voice><MediaId><![CDATA[" + mediaid + "]]></MediaId></Voice>",
	"</xml>"].join("");
};
WXMessage.prototype.createVideoResponse = function(mediaid,title,description){
	return ["<xml>",
	"<ToUserName><![CDATA[" + this.FromUserName + "]]></ToUserName>",
	"<FromUserName><![CDATA[" + this.ToUserName + "]]></FromUserName>",
	"<CreateTime>" + WXMessage.timespan() + "</CreateTime>",
	"<MsgType><![CDATA[video]]></MsgType>",
	"<Video><MediaId><![CDATA[" + mediaid + "]]></MediaId>"+
	(title!==undefined?"<Title><![CDATA[" + title + "]]></Title>" : "")+
	(description!==undefined?"<Description><![CDATA[" + description + "]]></Description>" : "")+
	"</Video>",
	"</xml>"].join("");
};
WXMessage.prototype.createMusicResponse = function(ThumbMediaId,title,description,MusicURL,HQMusicUrl){
	return ["<xml>",
	"<ToUserName><![CDATA[" + this.FromUserName + "]]></ToUserName>",
	"<FromUserName><![CDATA[" + this.ToUserName + "]]></FromUserName>",
	"<CreateTime>" + WXMessage.timespan() + "</CreateTime>",
	"<MsgType><![CDATA[music]]></MsgType>",
	"<Music>"+
	(title!==undefined?"<Title><![CDATA[" + title + "]]></Title>" : "")+
	(description!==undefined?"<Description><![CDATA[" + description + "]]></Description>" : "")+ 
	(MusicURL!==undefined?"<MusicUrl><![CDATA[" + MusicURL + "]]></MusicUrl>" : "")+ 
	(HQMusicUrl!==undefined?"<HQMusicUrl><![CDATA[" + HQMusicUrl + "]]></HQMusicUrl>" : "")+ 
	"<ThumbMediaId><![CDATA[" + ThumbMediaId + "]]></ThumbMediaId></Music>",
	"</xml>"].join("");
};
WXMessage.prototype.createNewsResponse = function(){
	if(arguments.length==4){
		this.News.clear();
		this.News.append(arguments[0],arguments[1],arguments[2],arguments[3]);
	}
	if(this.News.length<=0)return "";
	var news="";
	for(var i=0;i<this.News.length;i++){
		news+=["<item>",
		"<Title><![CDATA[" + this.News[i].title + "]]></Title>",
		"<Description><![CDATA[" + this.News[i].content + "]]></Description>",
		"<PicUrl><![CDATA[" + this.News[i].pic + "]]></PicUrl>",,
		"<Url><![CDATA[" + this.News[i].url + "]]></Url>",
		"</item>"].join("");
	}
	return ["<xml>",
	"<ToUserName><![CDATA[" + this.FromUserName + "]]></ToUserName>",
	"<FromUserName><![CDATA[" + this.ToUserName + "]]></FromUserName>",
	"<CreateTime>" + WXMessage.timespan() + "</CreateTime>",
	"<MsgType><![CDATA[news]]></MsgType>",
	"<ArticleCount>" + this.News.length + "</ArticleCount>",
	"<Articles>",
	news,
	"</Articles>",
	"<FuncFlag>0</FuncFlag>",
	"</xml>"].join("");
};
module.exports = WXMessage;