<script language="jscript" runat="server">
SafeCodeController = IController.create();
SafeCodeController.extend("Index",function(){
	this.display("Home:Safecode");
});
SafeCodeController.extend("Normal",function(){
	ExceptionManager.errorReporting(E_ERROR);
	Safecode("test");
});
SafeCodeController.extend("Complex",function(){
	ExceptionManager.errorReporting(E_ERROR);
	Safecode("test", {
		length:8, /*验证码长度*/
		odd:3, /*噪点数*/
		padding:5 /*内边距*/
	});
});
</script>