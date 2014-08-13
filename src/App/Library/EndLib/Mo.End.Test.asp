<script language="jscript" runat="server">
MoEndTest = IClass.create();
MoEndTest.extend("Index", function(){
	F.echo("耗时："+Mo.runtime.ticks() +"MS!",true);
});
</script>