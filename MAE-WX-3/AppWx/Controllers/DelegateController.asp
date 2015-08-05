<script language="jscript" runat="server">
/*
全局说明：
（1）WX - 微信消息对象（WXMessage），封装了各种响应以及粉丝发送过来的各种信息
WXMessage.MsgType : 消息类型
WXMessage.ToUserName : 消息发送的目标用户（公众账号）
WXMessage.FromUserName : 消息来源用户
WXMessage.CreateTime : 消息时间戳
WXMessage.MsgId : 消息ID
WXMessage.Request : 封装了消息的详细信息，详细信息通过回调的参数反映出来
WXMessage.Message : 接收到的XML信息
WXMessage.Reply : 待回复的XML信息
WXMessage.EncryptType : 加密方式，aes和raw，程序会自动加密/解密。
	WXMessage.EncryptType为aes时：
		WXMessage.AppID：接受到的消息解密出来的appID
		WXMessage.Message：接受到的消息解密后的明文。
		WXMessage.Ori.Message：接受到的消息解密前的密文。
		WXMessage.Reply：待发送的消息加密后的密文。
		WXMessage.Ori.Reply：待发送的消息加密前的明文。
		
（2）如果在事件中需要回复粉丝，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
WXMessage.createTextResponse(content);
WXMessage.createImageResponse(mediaid);
WXMessage.createVoiceResponse(mediaid);
WXMessage.createVideoResponse(mediaid,title,description);
WXMessage.createMusicResponse(ThumbMediaId,title,description,MusicURL,HQMusicUrl);
WXMessage.createNewsResponse(title, content, url, picurl); //用于发送单条新闻
WXMessage.createNewsResponse(); //发送单条或多条新闻，取决于WXMessage.News对象
WXMessage.News：封装多条新闻信息，用于createNewsResponse方法。
WXMessage.News.clear()：删除所有的新闻。
WXMessage.News.push({title:"", content:"", url:"", picurl:""})：添加一条新闻。
WXMessage.News.push(title, content, url, picurl)：添加一条新闻。
*/
var WXConf = C("@.WX");
DelegateController = IController.create(function(){this.logname = __dirname + "\\Debugs\\" + F.formatdate(new Date(),"yyyy-MM-dd")+".log";});
DelegateController.AsPrivate();

/*
事件：当消息到达时
*/
DelegateController.extend("OnMessageReceived",function(WX){
	//return; //如果要日志，请注释掉本行
	if(WX.EncryptType=="aes"){
		WriteLog(this.logname, "【收到消息】\r\n" + F.server("QUERY_STRING") + "\r\n长度：" + WX.MessageLength + "\r\n密文：" + WX.Ori.Message +"\r\n原文：" + WX.Message);
	}else{
		WriteLog(this.logname, "【收到消息】" + F.server("QUERY_STRING") + "\r\n" + WX.Message);
	}
});

/*
事件：发送回复信息前
说明：如果返回false，则不发送回复的信息。
*/
DelegateController.extend("OnBeforeReplySent",function(WX){
	//return; //如果要日志，请注释掉本行
	//WX.Reply = WX.createTextResponse("咋地，我就把你劫持了！");
	//if(WX.EncryptType=="aes")WX.encrypt();
	if(WX.EncryptType=="aes"){
		WriteLog(this.logname, "【回复消息】\r\n长度：" + WX.MessageLength + "\r\n密文：" + WX.Reply+"\r\n原文：" + WX.Ori.Reply+"\r\n");
	}else{
		WriteLog(this.logname, "【回复消息】" + WX.Reply+"\r\n");
	}
});

/*
事件：出现错误时
参数：
	exception = 异常信息
*/
DelegateController.extend("OnError",function(WX, exception){
	//return; //如果要日志，请注释掉本行
	WriteLog(__dirname + "\\Debugs\\ERROR.log", F.server("QUERY_STRING") + "\r\n" + exception + "\r\n");
});

/*
事件：接收到文本信息时
参数：
	Content = 文本内容
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnText",function(WX, Content){
	if(Content=="新闻"){ //这里测试用，如果给公众账号发送“新闻”两个字，则回复一条新闻信息
		WX.News.push("二向箔!", "给我一张二向箔，清理用。", "http://www.lrcoo.com/weixin/single/er-xiang-bo.html", "http://www.lrcoo.com/weixin/single/images/san-ti.jpg");
		return WX.createNewsResponse();
	}else{
		return WX.createTextResponse("已收到文本消息：" + Content);
	}
});

/*
事件：接收到图片信息时
参数：
	MediaId = 图片素材ID
	PicUrl = 图片链接
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnImage",function(WX, MediaId, PicUrl){
	//return WX.createTextResponse("已收到图片消息：" + MediaId + "=" + PicUrl); //返回一条文本信息
	//return WX.createImageResponse(MediaId);//直接把原图返回给粉丝。

	//返回news
	WX.News.push("已收到您的图片信息!", "给我一张二向箔，清理用。", "http://www.lrcoo.com/weixin/single/er-xiang-bo.html", PicUrl);
	WX.News.push("33张赤裸裸的人性图!", "33张赤裸裸的人性图。","http://www.lrcoo.com/weixin/33/33-zhang-chi-luo-luo-ren-xing-tu.html","http://www.lrcoo.com/weixin/33/files/44726644_1.jpg");
	WX.News.push("被“手机”抓走的粑粑麻麻", "被“手机”抓走的粑粑麻麻","http://www.lrcoo.com/weixin/sj/bei-shou-ji-zhua-zou-de-ba-ba-ma-ma.html","http://www.lrcoo.com/weixin/sj/images/460_01.jpg");
	WX.News.push("光粒-刘慈欣《地球往事-黑暗森林》!", "光粒-刘慈欣《地球往事-黑暗森林》。","http://www.lrcoo.com/weixin/single/guang-li.html","http://www.lrcoo.com/weixin/single/images/san-ti-2.jpg");
	return WX.createNewsResponse();
});

/*
事件：接收到语音信息时
参数：
	Format = 语音格式
	MediaId = 语音素材ID
	Recognition = 开启语音识别时的文本内容
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnVoice",function(WX, Format,MediaId,Recognition){
	//return WX.createTextResponse("已收到语音消息：" + MediaId);
	return WX.createVoiceResponse(MediaId);//直接把原语音返回给粉丝。
});

/*
事件：接收到视频信息时
参数：
	ThumbMediaId = 视频缩略图素材ID
	MediaId = 视频素材ID
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnVideo",function(WX, ThumbMediaId,MediaId){
	return WX.createTextResponse("已收到视频消息：" + MediaId);
});

/*
事件：接收到位置信息时，用户在聊天框主动发送位置，非位置推送，位置推送为OnReceiveLocation事件
参数：
	Location_X = 纬度
	Location_Y = 经度
	Scale = 放大倍数
	Label = 位置标签
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnLocation",function(WX, Location_X,Location_Y,Scale,Label){
	return WX.createTextResponse("已收到位置消息：" + Location_X + "," + Location_Y + " = " + Label);
});

/*
事件：接收到链接信息时
参数：
	Title = 标题
	Description = 描述
	Url = 链接地址
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnLink",function(WX, Title,Description,Url){
	return WX.createTextResponse("已接收到链接信息：" + Title);
});

/*
事件：群发消息结束时的事件推送
参数：
	MsgID = 消息ID
	Status = 发送状态
	TotalCount = 总群发条数
	FilterCount = 过滤条数
	SentCount = 已发送条数
	ErrorCount = 错误条数
说明：这里不需要返回任何内容
*/
DelegateController.extend("OnMessageMutiFinished",function(WX, MsgID,Status,TotalCount,FilterCount,SentCount,ErrorCount){
	//todo
});

/*
事件：接收到推送位置信息时
参数：
	Latitude = 纬度
	Longitude = 经度
	Precision = 精度
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnReceiveLocation",function(WX, Latitude,Longitude,Precision){
	var TXAPI = require("wx/TXAPI.js");
	var address="未知";
	if(TXAPI){
		var cTXAPI = new TXAPI(WXConf.txkey),
			Gps = cTXAPI.Translate(Latitude + "," + Longitude),
			Pos = cTXAPI.Geoencoder(Gps.x + "," + Gps.y);
		if(Pos.status==0) address = Pos.result.address;
	}
	return WX.createTextResponse("已收到位置推送事件：" + F.format("{0},{1}={2}\n地理位置：{3}",Latitude,Longitude,Precision,address));
});

/*
事件：当用户点击有效菜单时
参数：
	EventKey = 事件关键字（创建菜单时设置的关键字）
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnClickMenu",function(WX, EventKey){
	return WX.createTextResponse("已收到点击菜单事件：" + EventKey);
});

/*
事件：当用户点击菜单的链接时
参数：
	Url = 用户点击的链接
说明：这里不需要返回任何内容
*/
DelegateController.extend("OnViewMenu",function(WX, Url){
	//这里主动调用客服接口，给粉丝发送信息
	var WXServicesKf = require("wx/WXServicesKf.js");
	this.KF = new WXServicesKf(WXConf.appid, WXConf.appsecret);
	if(!this.KF.getAccessToken())return;
	this.KF.sendtext(WX.FromUserName, "点击链接了：" + Url);
});

/*
事件：当用户扫描二维码时（用户已关注）
参数：
	SceneId = 场景ID
	Ticket = 票据
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnScanQrcode",function(WX, SceneId,Ticket){
	return WX.createTextResponse("已收到扫描二维码事件：场景-" + SceneId);
});

/*
事件：当用户通过扫描带场景的二维码并关注时
参数：
	SceneId = 场景ID
	Ticket = 票据
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnSubscribeWithQrcode",function(WX, SceneId,Ticket){
	return WX.createTextResponse("已收到扫描带场景的二维码关注事件：场景-" + SceneId);
});

/*
事件：当用户关注时
说明：如果需要回复内容，必须返回标准的xml格式信息，WX对象已经对各种响应进行了封装
*/
DelegateController.extend("OnSubscribe",function(WX){
	return WX.createTextResponse("已收到关注事件：" + WX.FromUserName);
});

/*
事件：当用户取消关注时
说明：不需要回复，因为你回复了也没用，只要处理下你自己的逻辑就好了。
*/
DelegateController.extend("OnUnsubscribe",function(WX){
	//todo
});
</script>