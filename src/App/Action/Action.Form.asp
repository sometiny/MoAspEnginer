<script language="jscript" runat="server">
ActionForm = IAction.create();
ActionForm.extend("Index", function(){
	this.display("Home:Form");
});
ActionForm.extend("Index",true,function(){
	this.assign("description","哈哈，调用post了。");
	this.assign("dump",F.post.dump(true));
	this.display("Home:Form");
});
</script>