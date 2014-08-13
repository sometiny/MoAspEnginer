<script language="jscript" runat="server">
FormController = IController.create();
FormController.extend("Index", function(){
	this.display("Home:Form");
});
FormController.extend("Index",true,function(){
	this.assign("description","哈哈，调用post了。");
	this.assign("dump",F.post.dump(true));
	this.display("Home:Form");
});
</script>