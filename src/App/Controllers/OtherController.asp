<script language="jscript" runat="server">
OtherController = IController.create(function(){
	this.Name = "我来自另外的控制器[" + __filename + "]！" ;
});
OtherController.extend("Index", function(name){
	return this.Name + "=&gt;" + name;
});
</script>