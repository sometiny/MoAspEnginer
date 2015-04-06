<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
CookieController = IController.create();
CookieController.extend("Index", function(){
	cookie("name", "艾恩 aAsp;asd");
	cookie("other", {age:23, school:"ouc啊！d; adf", now: F.formatdate(new Date(), "yyyy-MM-dd HH:mm:ss"), data:"sdsdsds" }, {secure:false});
	F.echo("cookie sent. check it: <a href=\"?m=Cookie&a=Show\" target=\"_blank\">查看</a>",true);
});
CookieController.extend("Show", function(){
	F.echo(cookie("name"),true);
	dump(cookie("other"));
});
CookieController.extend("empty", function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>