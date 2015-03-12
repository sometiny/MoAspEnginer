<script language="jscript" runat="server">
LoaderController = IController.create();
LoaderController.extend("Index", function(){
	var type = "css", files = F.get("files");
	if(!/^([\w\/\.\-\_\;]+)$/igm.test(files)) return;
	if(files.substr(files.length-3).toLowerCase()==".js") type = "js";
	files = files.replace(/\.(js|css)$/ig,"");
	var gizcachefile = __DIR__ + "\\gzipcache\\" + files.replace(/[^\w]/ig,"_") + ".gz";
	Response.ContentType="text/" + type.replace("js","javascript");
	Response.AddHeader("Vary","Accept-Encoding");
	Response.AddHeader("Content-Encoding","gzip");
	if(IO.file.exists(gizcachefile)){
		F.echo(IO.file.readAllBytes(gizcachefile),F.TEXT.BIN);
		return;
	}
	var fs = files.split(";"),filecontent="";
	for(var i=0;i<fs.length;i++){
		var f = F.mappath(fs[i]+"." + type);
		if(IO.file.exists(f)) filecontent += IO.file.readAllText(f);
	}
	if(filecontent.length>0){
		var gzipcontent = Gzip(filecontent);
		IO.file.writeAllBytes(gizcachefile,gzipcontent);
		F.echo(gzipcontent,F.TEXT.BIN);
	}
});
function Gzip(content){
	F.require("encoding");
	var gzip = F.require("gzip/deflate");
	var data = F.exports.encoding.utf8.getBytes(content);
	var gdata=gzip.deflate(data,{gzip:true});
	return F.base64.toBinary(F.base64.e(gdata));
}
</script>