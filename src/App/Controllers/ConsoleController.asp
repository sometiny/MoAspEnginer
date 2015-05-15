<script language="jscript" runat="server">
ConsoleController = IController.create(function(){
	MEM.errorReporting(E_NONE);
});
ConsoleController.extend("Index", function(){
	C("@.MO_COMPILE_CACHE", false);
	this.display("Home:Console");
});
ConsoleController.extend("Show", function(){
	F.echo(MEM.fromSession());
});
</script>