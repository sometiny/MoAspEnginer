<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
HttpRequestController = IController.create();

/*
** 发送http-request请求到本控制器的ShowServer方法；
*/
HttpRequestController.extend("Index", function(){
	var httprequest = require("net/http/request");
	if(!httprequest){
		F.echo("模块net不存在，需要安装。",true);
		return;
	}
	var text = httprequest.create(
		"http://" + F.server("HTTP_HOST") + Mo.Config.Global.MO_ROOT + "?m=HttpRequest&a=ShowServer",
		{
			method : "POST",
			headers : [
				"user-agent:MoAspEnginer1.0"
			],
			data : "data=sadasdsad",
			charset : "gbk"
		}
	).send().gettext("utf-8");
	F.echo(text);
});
HttpRequestController.extend("ShowServer", function(){
	dump(F.get());
	F.echo("\r\n");
	dump(F.post());
	F.echo("\r\n");
	dump(F.server());
});


HttpRequestController.extend("empty", function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>