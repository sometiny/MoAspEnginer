<script language="jscript" runat="server">
ConsoleController = IController.create(function(){
	MEM.errorReporting(E_NONE);
	C("MO_COMPILE_CACHE", false);
	C("MO_TEMPLATE_SPLIT", "/");
	var mo_debug_mode = C("MO_DEBUG_MODE");
	if(mo_debug_mode != "SESSION" && mo_debug_mode!="APPLICATION"){
		F.echo(F.format("当前Debug模式为'{0}'，请修改为'SESSION'或'APPLICATION'才可以使用ExceptionManager控制台。<br />请修改配置项MO_DEBUG_MODE的值为'SESSION'或'APPLICATION'，正式上线后建议使用DIRECT模式。", mo_debug_mode));
		return false;
	}
});
ConsoleController.extend("Index", function(){
	this.display("Home:Console");
});
ConsoleController.extend("Show", function(){
	F.echo(MEM.fromSession());
});
</script>