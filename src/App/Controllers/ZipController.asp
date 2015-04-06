<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
ZipController = IController.create();
ZipController.extend("Index", function(name){
	this.display("Home:Zip");
});
ZipController.extend("Zip", function(){
	var Zip = require("zip");
	Zip.zipFile(__dirname+"\\Mo.png",__dirname+"\\Mo.zip",{compression:"DEFLATE"});
	this.assign("result", "Zip文件压缩到：" + __dirname+"\\Mo.zip");
	this.display("Home:Zip");
});
ZipController.extend("ZipFolder", function(){
	var Zip = require("zip");
	Zip.zipFolder(IO.parent(__dirname)+"\\Views",__dirname+"\\Controller.zip",{compression:"DEFLATE",base64:true});
	this.assign("result", "Zip文件压缩到：" + __dirname+"\\Controller.zip");
	this.display("Home:Zip");
});
ZipController.extend("UnZip", function(){
	var Zip = require("zip");
	Zip.unZip(__dirname+"\\Controller.zip",__dirname+"\\Controllers",{base64:true});
	this.assign("result", "Zip文件解压到：" + __dirname+"\\Controllers");
	this.display("Home:Zip");
});
ZipController.extend("empty", function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>