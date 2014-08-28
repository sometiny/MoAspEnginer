<script language="jscript" runat="server">
FormController = IController.create();
FormController.extend("Index", function(){
	this.display("Home:Form");
});
FormController.extend("Index",true,function(){
	this.assign("description","哈哈，调用post了。");
	this.assign("dump",F.post.dump(true));
	this.display("Home:Form");
});
FormController.extend("Upload",function(){
	F.require("net/upload");
	F.exports.net.upload({
		AllowFileTypes : "*.jpg;*.png;*.gif;*.bmp", /*only these extensions can be uploaded.*/
		AllowMaxSize : "1Mb", /*max upload-data size*/
		Charset : "utf-8", /*client text charset*/
		SavePath : __DIR__ + "\\upload", /*dir that files will be saved in it.*/
		RaiseServerError : false /* when it is false, don not push exception to Global ExceptionManager, just save in F.exports.upload.exception.*/,
		OnError:function(e,cfg){ /*event, on some errors are raised. */
			Mo.assign("exception", e);
		},
		OnSucceed:function(cfg){
			Mo.assign("filecount", this.files.length);
			Mo.assign("form1", F.post("form1"));
			Mo.assign("select1", F.post("select1"));
			
			this.save(this("file1"), {
				OnError : function(e){
					Mo.assign("file1", e);
				},
				OnSucceed : function(count,files){
					Mo.assign("file1", "文件'" + files[0].LocalName + "'上传成功，保存位置'" + files[0].Path + files[0].FileName + "',文件大小" + files[0].Size + "字节");
				}
			});

			this.save("file2", {
				OnError : function(e){
					Mo.assign("file2", e);
				},
				OnSucceed : function(count,files){
					Mo.assign("file2", "文件'" + files[0].LocalName + "'上传成功，保存位置'" + files[0].Path + files[0].FileName + "',文件大小" + files[0].Size + "字节");
				}
			});
		}
	});
	this.display("Home:Form");
});
</script>