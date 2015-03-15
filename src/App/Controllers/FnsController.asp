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
	//用来把文件压缩为gzip格式，传输给浏览器
	var gzip = require("gzip/deflate.js");
	var data = F.base64.d(F.base64.fromBinary(IO.file.readAllBytes(__DIR__+"\\20140721.png")));
	var gdata=gzip.deflate(data,{gzip:true});
	Response.AddHeader("Vary","Accept-Encoding");
	Response.AddHeader("Content-Type","image/png");
	Response.AddHeader("Content-Encoding","gzip");
	F.echo(F.base64.toBinary(F.base64.e(gdata)),F.TEXT.BIN);

	//测试下解压缩，基本用不到
	var ungzip = require("gzip/inflate.js");
	var ugdata = ungzip.inflate(gdata,{gzip:true});
	IO.file.writeAllBytes(__DIR__+"\\20140721-1.png",F.base64.toBinary(F.base64.e(ugdata)));
});
FnsController.extend("Zip", function(){
	var Zip = require("zip");
	Zip.zipFile(__DIR__+"\\CryptoJSController.asp",__DIR__+"\\CryptoJSController.zip",{compression:"DEFLATE"});
});
FnsController.extend("ZipFolder", function(){
	var Zip = require("zip");
	Zip.zipFolder(__DIR__+"\\ss",__DIR__+"\\ss.zip",{compression:"DEFLATE",base64:true});
});
FnsController.extend("UnZip", function(){
	var Zip = require("zip");
	Zip.unZip(__DIR__+"\\ss.zip",__DIR__+"\\ssss2",{base64:true});
});
FnsController.extend("empty", function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>