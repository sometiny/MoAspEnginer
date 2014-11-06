<script language="jscript" runat="server">
ServicesController = IController.create(function(){
	F.require("wx/WXServices");
	if(!F.exports.WXServices) return false;
	this.Tool = new F.exports.WXServices(Mo.C("WX.appid"),Mo.C("WX.appsecret"));
	if(!this.Tool.getAccessToken()) return false;
});
ServicesController.extend("qr",function(){
	var QR = this.Tool.createlimitqrcode(521);
	if(!QR.error){
		F.echo("<img src=\"https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + F.encode(QR.ticket) + "\" width=\"100\" height=\"100\" />");
	}else{
		F.echo(this.Tool.errmsg);
	}
});
ServicesController.extend("menu",function(act){
	if(act=="create"){
		JSON.encode=false;
		F.dump(this.Tool.createmenu(
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
		F.dump(this.Tool.deletemenu());
	}else{
		var menu = this.Tool.getmenu();
		F.dump(JSON.parse(menu));
	}
});
</script>