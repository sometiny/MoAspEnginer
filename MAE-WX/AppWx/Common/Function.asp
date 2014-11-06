<script language="jscript" runat="server">
var exports=["WriteLog","WriteWxLog","WriteExceptionLog"];
function WriteLog(path,msg){
	IO.file.appendAllText(path,F.format("{0:yyyy-MM-dd HH:mm:ss}",new Date()) + "："+msg+"\r\n");
}
function WriteWxLog(msg){
	WriteLog(__DIR__ + "\\wx.log",msg);
}
function WriteExceptionLog(msg){
	WriteLog(__DIR__ + "\\exception.log",msg);
}

</script>