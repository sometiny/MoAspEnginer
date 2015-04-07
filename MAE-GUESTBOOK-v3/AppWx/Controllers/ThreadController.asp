<script language="jscript" runat="server">
/*创建一个Controller，用来响应地址：?m=Thread&xxxx*/
ThreadController = IController.create(function(){
	if(F.session("wx_auth_name")=="") {
		F.goto("?m=Login&error=1&msg=" + F.encode("请登录。"));
		return false;
	}else{
		this.assign("subtitle","留言管理");
	}
});
/*板块管理*/
ThreadController.extend("Index",function(){
	/*取记录，显示到模板，PostFor=0的记录才是留言，否则为回复*/
	Model__("Thread","Id").where("PostFor=0").limit(F.get.int("page",1),10).orderby("Id desc").query().assign("Thread");
	this.display("Admin:Thread");
});

/*快捷回复留言*/
ThreadController.extend("edit",function(){
	/*先查找留言记录，这里的L为一个DataTable对象*/
	var L = Model__("Thread","Id").where("Id=" + F.get.int("Id")).query().fetch();
	if(L.eof()){
		F.echo("没有记录啊。");	
	}else{
		/*找到留言记录，用DataTable的read方法取出，并附加到系统*/
		this.assign("E",L.read());
		/*这里取前三条记录*/
		Model__("Thread","Id").limit(1,3).where("PostFor=" + F.get.int("Id")).orderby("id desc").query().assign("Reply");
		this.display("Admin:ThreadEdit");
	}
});

/*回复留言*/
ThreadController.extend("reply",function(){
	/*先查找留言记录，这里的L为一个DataTable对象*/
	var L = Model__("Thread","Id").where("Id=" + F.get.int("Id")).query().fetch();
	if(L.eof()){
		F.goto("?m=Thread&error=0&msg=" + F.encode("没有留言记录啊。"));
	}else{
		/*找到留言记录，用DataTable的read方法取出，并附加到系统*/
		this.assign("Thread",L.read());
		/*每页10条对回复进行分页，并将查询记录assign到Reply变量，用于循环*/
		Model__("Thread","Id").limit(F.get.int("page",1),10).where("PostFor=" + F.get.int("Id")).orderby("id desc").query().assign("Reply");
		this.display("Admin:ThreadReply");
	}
});

/*保存回复*/
ThreadController.extend("save",function(){
	/*先查找留言记录，这里的L为一个DataTable对象*/
	var L = Model__("Thread","Id").where("Id=" + F.post.int("Id")).query().fetch().read();
	if(!L) return F.echo("留言记录不存在。");
	var description = F.post.safe("Description");
	if(description=="") return F.echo("留言内容不能为空。");

	/*添加回复：
	* insert的另外一种重载：insert(field1,value1,field1,value2,...,fieldn,valuen);
	* field和value必须成对出现，否则无效
	* insert还有一种重载，就是insert(DataTableRow)，传递一个DataTableRow对象
	*/
	Model__("Thread","Id").insert(
		"Title", "#回复#",
		"Description", description,
		"PostDate", F.timespan(),/*timespan获取时间戳，默认为当前时间，我设计的数据库没有日期类型，只有文本和数字*/
		"PostFrom", "#管理员#",
		"PostIp", F.server("REMOTE_ADDR"),
		"PostFor", F.post.int("Id")
	);
	if(Model__.lastRows>0){
		/*设置留言为已回复状态。*/
		Model__("Thread","Id").where("Id=" + F.post.int("Id")).update("IsReplied",1);
		F.echo("已回复");
	}else{
		F.echo("操作失败，没有任何受影响的记录。");
	}
});

/*删除回复*/
ThreadController.extend("deletereply",function(){
	Model__("Thread","Id").where("Id=" + F.get.int("Id")).Delete();
	if(Model__.lastRows>0){
		F.echo("删除成功")
	}else{
		F.echo("删除失败，没有任何受影响的记录。");
	}	
});

/*删除留言*/
ThreadController.extend("delete",function(){
	var Id = F.get.int("Id");
	/*同事删除相关的回复*/
	Model__("Thread","Id").where("PostFor=" + Id + " or Id=" + Id).Delete();
	if(Model__.lastRows>0){
		F.goto("?m=Thread&error=0&msg=" + F.encode("删除成功。"));
	}else{
		F.goto("?m=Thread&error=1&msg=" + F.encode("删除失败，没有任何受影响的记录。"));
	}
});
ThreadController.extend("empty",function(a){
	F.goto("?m=" + Mo.Method + "&error=1&msg=" + F.encode("不支持的方法：" + a + "。"));
});
</script>