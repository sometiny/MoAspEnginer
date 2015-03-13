<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
FnsController = IController.create();

FnsController.extend("Index", function(){
	//
});
FnsController.extend("Gzip", function(){
	var gzip = F.require("gzip/deflate");
	var data = F.base64.d(F.base64.fromBinary(IO.file.readAllBytes(__DIR__+"\\20140721.png")));
	var gdata=gzip.deflate(data,{gzip:true});
	Response.AddHeader("Vary","Accept-Encoding");
	Response.AddHeader("Content-Type","image/png");
	Response.AddHeader("Content-Encoding","gzip");
	F.echo(F.base64.toBinary(F.base64.e(gdata)),F.TEXT.BIN);
});
FnsController.extend("empty", function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>