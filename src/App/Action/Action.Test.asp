<script language="jscript" runat="server">
function ActionTest(){
	this.empty=function(){};
}
ActionTest.prototype.Index = function(src){
	return src+"=>" + F.md5(src);
};
</script>