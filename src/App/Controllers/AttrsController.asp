<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
AttrsController = IController.create();

AttrsController.extend("Index", function(){
	var path = __dirname + "\\Mo.png", attr = -1;
	F.echo("文件路径：" + path, true);
	
	F.echo("<br />设置属性：系统、只读、隐藏", true);
	attr = IO.attr(path,IO.attrs.System | IO.attrs.ReadOnly | IO.attrs.Hidden);
	F.echo("操作结果：" + IO.attr.toString(attr), true);
	
	F.echo("<br />添加属性：存档", true);
	attr = IO.attr.add(path,IO.attrs.Archive);
	F.echo("操作结果：" + IO.attr.toString(attr), true);
	
	F.echo("<br />移除属性：系统", true);
	attr = IO.attr.remove(path,IO.attrs.System)
	F.echo("操作结果：" + IO.attr.toString(attr), true);
	
	F.echo("<br />移除属性：隐藏", true);
	attr = IO.attr.remove(path,IO.attrs.Hidden);
	F.echo("操作结果：" + IO.attr.toString(attr), true);
});
AttrsController.extend("empty", function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>