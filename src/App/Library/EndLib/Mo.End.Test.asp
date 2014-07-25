<script language="jscript" runat="server">
function MoEndTest(){
}
MoEndTest.prototype.Index = function(){
	F.echo("耗时："+Mo.runtime.ticks() +"MS!",true);
};
</script>