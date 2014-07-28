<script language="jscript" runat="server">
/*
** 创建一个新的Action对象；
** 语法：newAction = IAction.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
ActionTest = IAction.create(
	function(){
		this.Name="我来自另外的Action！";
	}
); 

/*
** 为新Action对象扩展一个新方法，对应相应的动作；
** 语法：newAction.extend(funcName,callback);
** funcName：方法名；
** callback：要执行的函数；
*/
ActionTest.extend("Index",function(){
	return this.Name;
});
ActionTest.extend("Show",function(){
	F.echo(this.Name,true);
});
ActionTest.extend("Test",function(){
	F.vbs.include("Upload");
	var upload = F.vbs.require("MoLibUpload");
	F.echo(upload.Version,true);
});
ActionTest.extend("empty",function(name){
	F.echo("调用不到" + name + "方法，就跑到Empty方法了！",true);
});
</script>