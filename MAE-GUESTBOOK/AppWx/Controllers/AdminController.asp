<script language="jscript" runat="server">
/*创建新的Controller*/
AdminController = IController.create(function(){
	/*在构造方法中判断登录状态*/
	if(F.session("wx_auth_name")=="") {
		F.goto("?m=Login&error=1&msg=" + F.encode("请登录。"));
		/*这里必须return false，防止后面的代码继续执行*/
		return false;
	}else{
		/*设置副标题*/
		this.assign("subtitle","系统配置");
	}
});
/*系统配置表单，响应地址：?m=Admin&a=Index或?m=Admin*/
AdminController.extend("Index",function(){
	
	/*从System表读取Tag为1的记录*/
	var L = Model__("System","Id").where("Tag=1").query().fetch();

	/*如果记录存在，read方法读出记录，并assign到系统，模板中可以调用*/
	if(!L.eof()) this.assign("System",L.read());

	/*显示模板*/
	this.display("Setting");
});

/*保存配置，响应地址：?m=Admin&a=savesetting*/
AdminController.extend("savesetting",function(){

	/*从post中移除Tag键，以防被覆盖*/
	F.post.remove("Tag");

	/*保存表单数据到System表*/
	Model__("System","Id").where("Tag=1").update();

	/*保存成功，跳转到首页*/
	F.goto("?m=Admin&error=0&msg=" + F.encode("保存成功"));
});

/*找不到指定action时，调用empty*/
AdminController.extend("empty",function(a){
	F.goto("?m=" + Mo.Method + "&error=1&msg=" + F.encode("不支持的方法：" + a + "。"));
});
</script>