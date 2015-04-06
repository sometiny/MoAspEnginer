<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
SessionController = IController.create();

SessionController.extend("Index", function(){
	var Session = require("session");
	if(!Session){
		F.echo("模块session不存在，需要安装。",true);
		return;
	}
	Session("name","艾恩123456789sdfsdfsdf");
	Session.setTimeout(800);
	F.echo("<a href=\"?m=Session&a=ShowSession&sessionid=" + Session.id + "\" target=\"_blank\">查看</a>");
});

SessionController.extend("ShowSession", function(){
	var Session = require("session");
	if(!Session){
		F.echo("模块session不存在，需要安装。",true);
		return;
	}
	F.echo(Session("name"),true);
	F.echo(Session.timeout,true);
	F.echo(Session.id,true);
});
SessionController.extend("empty", function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>