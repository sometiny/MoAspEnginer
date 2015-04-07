<script language="jscript" runat="server">
var System = {};
HomeController = IController.create(function(){
	/*将系统配置assign到系统*/
	Model__("System","Id").where("Tag=1").query().assign("System",true);
	System = Mo("System");
	/*判断是不是关闭了网站*/
	if(System.IsClosed==1){
		/*网站关闭，显示原因并退出程序，这里的return false是必须的*/
		F.echo(System.Reason);
		return false;
	}
});
HomeController.extend("Index",function(){
	/*Model__.allowDebug = true;*/
	
	/*按条件读取留言记录*/
	var Id;
	if((Id=F.get.int("Id",0))>0){
		/*如果有传递版块Id，则显示当前版块的信息*/
		var Forum = Model__("Forum","Id").orderby("OrderBy DESC,Id DESC").where("Hidden=0 and Tag=" + Id).query().read();
		this.assign("Forum",new DataTable([Forum])); /*板块列表，显示在头部的*/
		this.assign("ForumInfo",Forum); /*当前版块的信息*/

		/*读取当前板块下的留言列表*/
		Model__("Thread","Id").where("PostFor=0 and ForumTag=" + Id).limit(F.get.int("page",1),System.PageSize).orderby("Id DESC").query().assign("Thread");
		this.display("Forum");
	}else{
		/* 读取所有版块和前五条留言信息*/
		Model__("Forum","Id").orderby("OrderBy DESC,Id DESC").where("Hidden=0").query().assign("Forum");
		Model__("Thread","Id").where("PostFor=0").limit(1,5).orderby("Id DESC").query().assign("Thread");
		this.display("Home");
	}
});

HomeController.extend("thread",function(){
	/*Model__.allowDebug = true;*/
	
	/*按条件读取留言记录*/
	var Id=F.get.int("Id",0);
	if(Id>0){
		var L = Model__("Thread","Id").where("Id=" + Id).query().fetch().read();
		if(!L){
			F.goto("?m=Index","找不到相关留言。");
		}else{
			var ForumTag = L.ForumTag;
			var Forum = Model__("Forum","Id").where("Hidden=0 and Tag=" + ForumTag).query().fetch();
			if(Forum.eof()){
				F.goto("?m=Index","找不到相关板块。");
			}else{
				F.get("Id",ForumTag);/*这里覆盖Id的值，是为了让当前版块高亮*/
				this.assign("Thread",L);
				this.assign("Forum",Forum);
				/*读取所有的回复信息*/
				Model__("Thread","Id").where("PostFor=" +  Id).limit(F.get.int("page",1),System.PageSize).orderby("Id DESC").query().assign("Reply");
				this.display("Thread");
			}
		}
	}else{
		F.goto("?m=Index","参数错误。");
	}
});
HomeController.extend("postmessage",function(){
	/*引用表单验证库*/
	var validatee = require("validatee");
	var fv = new validatee();
	fv.addRule("SafeCode","required;length:4;","请填写正确的验证码。");
	fv.addRule("ForumTag","required;number;min:1","版块选择错误；");
	fv.addRule("PostFrom","max-length:50;","不超过50个字符；");
	fv.addRule("PostEmail","required;max-length:255;email;","邮箱必填，不超过255个字符；");
	fv.addRule("PostHomepage","max-length:50;exp:^http(s)?\\:\\/\\/","请输入正确的主页，不超过50个字符；");
	fv.addRule("Title","required;max-length:50;","标题必填，不超过50个字符；");
	fv.addRule("Description","required;max-length:1000;","内容必填，不超过1000个字符。");
	/*验证失败，退出*/
	if(!fv.validate()){
		return F.echo(fv.exception);
	}
	/*校验验证码*/
	if(IsEmpty(F.post("SafeCode")) || IsEmpty(F.session("wx_session_code1")) || F.post("SafeCode").toLowerCase()!=F.session("wx_session_code1").toLowerCase()){
		return F.echo("验证码填写错误。");
	}
	F.session("wx_session_code1",null);
	/*读取版块信息*/
	var Forum = Model__("Forum","Id").where("Tag=" + F.post.int("ForumTag")).query().read();
	/*如果不允许发表，退出并提示*/
	if(Forum.AllowPost==0){
		return F.echo("当前版块不允许发表留言。");
	}
	/*insert的另外一个重载，手动构建TableRow，插入数据库*/
	var Row = new DataTableRow();
	Row.set("ForumTag",F.post.int("ForumTag"));
	Row.set("Title",F.post.safe("Title",50));
	Row.set("Description",F.post.safe("Description"));
	Row.set("ForumName",Forum.Title);
	Row.set("PostDate",F.timespan());
	Row.set("PostIp",F.server("REMOTE_ADDR"));
	Row.set("PostFrom",F.post.safe("PostFrom",50));
	Row.set("PostEmail",F.post.safe("PostEmail"));
	Row.set("PostHomepage",F.post.safe("PostHomepage"));
	Model__("Thread","Id").insert(Row);
	if(Model__.lastRows>0){
		F.echo("留言发表成功。");
	}else{
		F.echo("留言发表失败。");
	}
});
HomeController.extend("empty",function(){
	F.echo("Page Not Found!");
});

/*模板里面用了Mo.A.Home.GetReply，这里直接fetch模板信息，并返回*/
HomeController.extend("GetReply",function(Id){
	Model__("Thread","Id").limit(1,1).where("PostFor=" + Id).orderby("Id DESC").query().assign("Reply");
	return Mo.fetch("Reply");
});
/*生成验证码*/
HomeController.extend("code",function(){
	var safecode = require("safecode");
	safecode("wx_session_code1");
});
</script>