<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
TestController = IController.create(
	function(){
		this.Name="我来自另外的Action！";
	}
); 

/*
** 为新Controller对象扩展一个新方法，对应相应的动作；
** 语法：newController.extend(funcName,callback);
** funcName：方法名；
** callback：要执行的函数；
*/
TestController.extend("Index",function(){
	return this.Name;
});
TestController.extend("Show",function(){
	F.echo(this.Name,true);
});
TestController.extend("Test",function(){
	F.vbs.include("Upload");
	var upload = F.vbs.require("MoLibUpload");
	F.echo(upload.Version,true);
});
TestController.extend("empty",function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>