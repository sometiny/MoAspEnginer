<script language="jscript" runat="server">
NoticeController = IController.create();
NoticeController.extend("Index",function(){
	var WXMessage = require("wx/WXMessage.js");
	var WXConf = C("@.WX");
	var WX = new WXMessage();
	var WxDelegate = Mo.A("Delegate");
	WX.SignManager.token=WXConf.token;
	WX.SignManager.timestamp = F.get("timestamp");
	WX.SignManager.nonce = F.get("nonce");
	if(F.server("REQUEST_METHOD")=="GET"){
		if(WX.SignManager.comparewith(F.get("signature"))){
			F.echo(F.get("echostr"));
		}else{
			if(WxDelegate.OnError) WxDelegate.OnError(WX, "signature error");
		}
		return;
	}
	try{
		var received = F.string.fromBinary(Request.BinaryRead(WXConf.maxrequestlength),"utf-8");
		if(!WX.loadRequest(received)){
			if(WxDelegate.OnError) WxDelegate.OnError(WX, "request parse error(" + WX.Exception + ")");
		}else{
			if(WxDelegate.OnMessageReceived) WxDelegate.OnMessageReceived(WX);
			if(WX.MsgType=="event"){
				WX.Reply = OnEvent(WX, WxDelegate);
			}else{
				WX.Reply = OnChat(WX, WxDelegate);
			}
			if(WX.EncryptType == "aes")WX.encrypt();
			if(WxDelegate.OnBeforeReplySent && WxDelegate.OnBeforeReplySent(WX)===false) return;
			F.echo(WX.Reply);
		}
	}catch(ex){
		if(WxDelegate.OnError) WxDelegate.OnError(WX, ex.description);
	}
});
NoticeController.extend("Test",function(){});
var OnEvent = function(WX,delgate_){
	if(WX.Request.Event =="subscribe"){
		if(F.string.startsWith(WX.Request.EventKey,"qrscene_") && WX.Request.Ticket!=""){
			if(delgate_.OnSubscribeWithQrcode) return delgate_.OnSubscribeWithQrcode(WX, WX.Request.EventKey.substr(8),WX.Request.Ticket);
		}else{
			if(delgate_.OnSubscribe) return delgate_.OnSubscribe(WX);
		}
	}else if(WX.Request.Event =="unsubscribe"){
		if(delgate_.OnUnsubscribe) delgate_.OnUnsubscribe(WX);
	}else if(WX.Request.Event =="LOCATION"){
		if(delgate_.OnReceiveLocation) return delgate_.OnReceiveLocation(WX, WX.Request.Latitude,WX.Request.Longitude,WX.Request.Precision);
	}else if(WX.Request.Event =="CLICK"){
		if(delgate_.OnClickMenu) return delgate_.OnClickMenu(WX, WX.Request.EventKey);
	}else if(WX.Request.Event =="VIEW"){
		if(delgate_.OnViewMenu) return delgate_.OnViewMenu(WX, WX.Request.EventKey);
	}else if(WX.Request.Event =="SCAN"){
		if(delgate_.OnScanQrcode) return delgate_.OnScanQrcode(WX, WX.Request.EventKey,WX.Request.Ticket);
	}else if(WX.Request.Event =="MASSSENDJOBFINISH"){
		if(delgate_.OnMessageMutiFinished) delgate_.OnMessageMutiFinished(WX, 
			WX.Request.MsgID,
			WX.Request.Status,
			WX.Request.TotalCount,
			WX.Request.FilterCount,
			WX.Request.SentCount,
			WX.Request.ErrorCount
		)
	}
	return "";
};
var OnChat = function(WX,delgate_){
	if(WX.MsgType=="text"){
		if(delgate_.OnText) return delgate_.OnText(WX, WX.Request.Content);
	}else if(WX.MsgType=="image"){
		if(delgate_.OnImage) return delgate_.OnImage(WX, WX.Request.MediaId,WX.Request.PicUrl);
	}else if(WX.MsgType=="voice"){
		if(delgate_.OnVoice) return delgate_.OnVoice(WX, WX.Request.Format,WX.Request.MediaId,WX.Request.Recognition);
	}else if(WX.MsgType=="video"){
		if(delgate_.OnVideo) return delgate_.OnVideo(WX, WX.Request.ThumbMediaId,WX.Request.MediaId);
	}else if(WX.MsgType=="location"){
		if(delgate_.OnLocation) return delgate_.OnLocation(WX, WX.Request.Location_X,WX.Request.Location_Y,WX.Request.Scale,WX.Request.Label);
	}else if(WX.MsgType=="link"){
		if(delgate_.OnLink) return delgate_.OnLink(WX, WX.Request.Title,WX.Request.Description,WX.Request.Url);
	}
	return "";
};
</script>