<script language="jscript" runat="server">
/*创建一个Controller，用来响应地址：?m=Forum&xxxx*/
ForumController = IController.create(function(){
	if(F.session("wx_auth_name")=="") {
		F.goto("?m=Login&error=1&msg=" + F.encode("请登录。"));
		return false;
	}else{
		this.assign("subtitle","版块管理");
	}
});
/*板块管理页面*/
ForumController.extend("Index",function(){

	/*读取板块，按照每页10条分页，按照排序值倒叙
	**用Model__的assign方法将DataTable附加到系统，变量名为Forum，用于循环loop标签
	*/
	Model__("Forum","Id").orderby("OrderBy desc").limit(F.get.int("page",1),10).query().assign("Forum");

	/*如果存在Id，就读取指定数据，用于编辑*/
	if(F.get.int("Id")>0) Model__("Forum","Id").where("Id=" + F.get.int("Id")).query().assign("E",true);

	/*显示内容，因为这里的Controller是Forum，必须用Admin:前缀来引用Admin目录的模板。*/
	this.display("Admin:Forum");
});

/*新建或修改板块*/
ForumController.extend("save",function(){
	/*强制定义两个参数的值，因为不选中复选框，不会传任何值过来*/
	if(F.post("AllowPost")!="1")F.post("AllowPost",0);
	if(F.post("Hidden")!="1")F.post("Hidden",0);

	/*根据Id来决定是插入还是更新*/
	if(F.post.int("Id")>0){
		F.post.remove("Tag");
		Model__("Forum","Id").update();
	}else{
		/*这里给板块的Tag字段取最大值+1*/
		F.post("Tag",Model__("Forum","Id").max("Tag")+1);
		Model__("Forum","Id").insert();
	}
	/*获取上次操作影响的函数，如果大于0，说明操作成功*/
	if(Model__.lastRows>0){
		F.goto("?m=Forum&error=0&msg=" + F.encode("操作成功。"));
	}else{
		F.goto("?m=Forum&error=1&msg=" + F.encode("操作失败，没有任何受影响的记录。"));
	}
});

/*删除板块*/
ForumController.extend("delete",function(){
	/*如果板块下有留言，禁止删除*/
	if(!Model__("Thread","Id").where("ForumTag=" + Model__("Forum","Id").where("Id=" + F.get.int("Id")).query().read("Tag")).query().fetch().eof()){
		F.goto("?m=Forum&error=1&msg=" + F.encode("删除失败，当前板块下还有留言记录。"));
		return;
	}
	/*执行删除操作，Delete方法或del方法*/
	Model__("Forum","Id").where("Id=" + F.get.int("Id")).Delete();
	if(Model__.lastRows>0){
		F.goto("?m=Forum&error=0&msg=" + F.encode("删除成功。"));
	}else{
		F.goto("?m=Forum&error=1&msg=" + F.encode("删除失败，没有任何受影响的记录。"));
	}
});
ForumController.extend("empty",function(a){
	F.goto("?m=" + Mo.Method + "&error=1&msg=" + F.encode("不支持的方法：" + a + "。"));
});
</script>