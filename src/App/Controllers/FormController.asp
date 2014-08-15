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
	F.require("upload");
	var succeed = F.exports.upload({
		AllowFileTypes : "*.jpg;*.png;*.gif;*.bmp", /*only these extensions can be uploaded.*/
		AllowMaxSize : "1Mb", /*max upload-data size*/
		Charset : "utf-8", /*client text charset*/
		SavePath : __DIR__ + "\\upload", /*dir that files will be saved in it.*/
		RaiseServerError : false /* when it is false, don not push exception to Global ExceptionManager, just save in F.exports.upload.exception.*/
	});
	if(!succeed)
	{
		this.assign("exception", F.exports.upload.exception);
	}
	else
	{
		this.assign("filecount", F.exports.upload.files.length);
		this.assign("form1", F.post("form1"));
		this.assign("select1", F.post("select1"));
		
		var File = F.exports.upload("file1");

		/*the first way to save file, alse you can use Upload.save([Option[,OverWrite]]) to save all the files.*/
		if(F.exports.upload.save(File,0)>0)
		{
			this.assign("file1", "文件'" + File.LocalName + "'上传成功，保存位置'" + File.Path + File.FileName + "',文件大小" + File.Size + "字节");
		}else{
			this.assign("file1", F.exports.upload.exception,true);
		}
		
		File = F.exports.upload("file2");
		/*the second way to save file*/
		if(F.exports.upload.save("file2",0,true)>0)
		{
			
			this.assign("file2", "文件'" + File.LocalName + "'上传成功，保存位置'" + File.Path + File.FileName + "',文件大小" + File.Size + "字节");
		}else{
			this.assign("file2", F.exports.upload.exception);
		}
	}
	this.display("Home:Form");
});
</script>