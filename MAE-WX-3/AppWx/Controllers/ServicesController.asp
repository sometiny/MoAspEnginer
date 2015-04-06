<script language="jscript" runat="server">
var WXConf = C("@.WX");
var WXServices = require("wx/WXServices.js");
ServicesController = IController.create(function(){
	if(!WXServices) return false;
	this.Tool = new WXServices(WXConf.appid, WXConf.appsecret);
	if(!this.Tool.getAccessToken()) return false;
});
/*获取二维码*/
ServicesController.extend("qr",function(){
	var QR = this.Tool.createlimitqrcode(521);
	if(!QR.error){
		F.echo("<img src=\"https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + F.encode(QR.ticket) + "\" width=\"100\" height=\"100\" />");
	}else{
		F.echo(this.Tool.errmsg);
	}
});
/*获取微信服务器IP*/
ServicesController.extend("getwxip",function(){
	var res = this.Tool.getwxip();
	dump(res);
});
ServicesController.extend("clearcache",function(){
	this.Tool.clearCache();
});
ServicesController.extend("menu",function(act){
	if(act=="create"){
		JSON.stringify({});
		JSON.encode=false;
		dump(this.Tool.createmenu(
			JSON.stringify({
				button : [
					{type : "click", name : "点击", key : "click_method_1"},
					{type : "view", name : "链接", url : "http://www.lrcoo.com/weixin/single/er-xiang-bo.html"},
					{name : "子菜单", sub_button :[
						{type : "click", name : "点击1", key : "click_method_1_1"},
						{type : "click", name : "点击2", key : "click_method_1_2"},
						{type : "view", name : "链接1", url : "http://www.lrcoo.com/weixin/single/guang-li.html"}
					]}
				]
			},null,"\t")
		));
		F.echo(this.Tool.errmsg);
	}else if(act=="delete"){
		dump(this.Tool.deletemenu());
	}else{
		var menu = this.Tool.getmenu();
		dump(JSON.parse(menu));
	}
});
</script>