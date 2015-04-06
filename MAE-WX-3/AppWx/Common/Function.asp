<script language="jscript" runat="server">
WriteLog = function(path,msg){
	IO.file.appendAllText(path,F.format("{0:yyyy-MM-dd HH:mm:ss}",new Date()) + "："+msg+"\r\n");
}
WriteWxLog = function(msg){
	WriteLog(__dirname + "\\wx.log",msg);
}
WriteExceptionLog = function(msg){
	WriteLog(__dirname + "\\exception.log",msg);
}

</script>