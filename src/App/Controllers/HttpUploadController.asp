<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
HttpUploadController = IController.create();


/*
** 发送http-upload请求到本控制器的UploadFile方法；
*/
HttpUploadController.extend("Index", function(){
	var httpupload = require("net/http/upload");
	if(!httpupload){
		F.echo("模块net不存在，需要安装。",true);
		return;
	}
	var upload = httpupload.create(
		"http://" + F.server("HTTP_HOST") + Mo.Config.Global.MO_ROOT + "?m=HttpUpload&a=UploadFile",
		/*下面通过create方法直接添加表单数据*/
		{
			forms :{
				"form1" : "测试"
			},
			files : 
			{
				"file1" : __dirname + "\\Mo.png",
				"file2" : 
				{
					path : __dirname + "\\Mo.png",
					contentType : "image/png"
				}
			}
		}
	);
	/*也可以通过下面的接口添加表单数据*/
	upload.appendForm("select1","select测试1");
	upload.appendFile("file1",__dirname + "\\Mo.png","image/png"); /*支持同表单名的多文件。*/
	var text = upload.send().gettext("utf-8")
	F.echo("<pre>");
	F.echo(F.encodeHtml(text));
	F.echo("</pre>");
});
HttpUploadController.extend("UploadFile", function(){
	var upload = require("net/upload");
	if(!upload){
		F.echo("模块net不存在，需要安装。",true);
		return;
	}
	upload({
		AllowFileTypes : "*.jpg;*.png;*.gif;*.bmp",
		AllowMaxSize : "1Mb",
		Charset : "utf-8",
		SavePath : __dirname + "\\upload",
		RaiseServerError : false,
		OnError:function(e,cfg){
			F.echo("exception : "+ e, true);
		},
		OnSucceed:function(cfg){
			F.echo("filecount : " + this.files.length, true);
			F.echo("form1 : "+ F.post("form1"), true);
			F.echo("select1 : " + F.post("select1"), true);
			this.save("file1", {
				OnError : function(e){
					F.echo("file1 : " + e,true);
				},
				OnSucceed : function(count,files){
					/*支持同表单名的多文件，即：支持HTML5上传。*/
					for(var i=0;i<files.length;i++)
					{
						F.echo(files[i].FormName + " : 文件'" + files[i].LocalName + "'上传成功，保存位置'" + files[i].Path + files[i].FileName + "',文件大小" + files[i].Size + "字节",true);
					}
				}
			});
		}
	});
});

HttpUploadController.extend("empty", function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>