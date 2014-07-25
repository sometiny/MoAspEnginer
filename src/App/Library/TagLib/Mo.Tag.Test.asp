<script language="jscript" runat="server">
function MoTagTest(){
}
MoTagTest.prototype.Index = function(attrs){
	return "<div style=\"color:" + attrs.color + "\">" + attrs.name + "</div>";
};
</script>