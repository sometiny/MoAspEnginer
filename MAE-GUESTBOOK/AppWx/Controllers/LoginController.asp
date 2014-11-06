<script language="jscript" runat="server">
/*创建一个Controller，没有任何构造或析构方法*/
LoginController = IController.create();

/*显示登录页面，响应地址：?m=Login&a=Index*/
LoginController.extend("Index",function(){
	this.display("Admin:login");
});

/*和上面的方法一样，响应地址：?m=Login&a=Index，但注意第二个参数为true，说明这个方法用来专门响应POST请求的数据*/
LoginController.extend("Index",true,function(){
	/*判断验证码*/
	if(F.post.safe("login.code")=="" || F.session("wx_session_code")=="" || F.post.safe("login.code").toLowerCase()!=F.session("wx_session_code").toLowerCase()){
		F.goto("?m=Login&msg=" + F.encode("请输入正确的验证码"));
		return;
	}
	/*验证码判断完成后，清空*/
	F.session("wx_session_code",null);

	/*读取用户名和密码*/
	var name=F.post.exp("login.name","^\\w+$"),pwd=F.post("login.pwd"),code=F.post.safe("login.code");
	if(name==""){
		F.goto("?m=Login&msg=" + F.encode("请输入合法的用户名"));
		return;
	}
	/*根据用户名查询数据库*/
	var L = Model__("Authorize","Id").where("Name='" + name + "'").query().fetch();
	if(L.eof()){
		/*没找到用户，退出*/
		F.goto("?m=Login&msg=" + F.encode("错误的登录信息"));
	}else{
		/*用户找到，去除用户对应的TableRow，直接用“TableRow.字段名”取数据*/
		var R = L.read();

		/*引用下sha1的类库，这里用到sha摘要，引用成功后，用F.exports.sha1调用相关的方法*/
		F.require("sha1");
		/*校验密码，密码的生成规则，先SHA2再MD5再SHA1，SHA2为自己写的简单混淆算法*/
		if(F.exports.sha1.SHA1(F.md5(F.exports.sha1.SHA2(pwd)))!=R.Auth){
			/*验证失败，跳走*/
			F.goto("?m=Login&msg=" + F.encode("错误的登录信息"));
		}else{
			/*验证成功，检验用户锁定状态*/
			if(R.IsLocked == 1){
				/*用户被锁定，跳走并显示原因*/
				F.goto("?m=Login&msg=" + F.encode("账户被锁定。原因：" + R.LockReason));
			}else{
				/*登录成功，更新用户的登录次数，以及时间、IP等，同时写session记录登录状态，跳到管理页面*/
				Model__("Authorize","Id").where("Name='" + name + "'").update("LoginTimes",R.LoginTimes+1,"LastLoginDate",F.timespan(),"LastLoginIP",F.server("REMOTE_ADDR"));
				F.session("wx_auth_name",R.Name);
				F.session("wx_auth_LastLoginDate",R.LastLoginDate);
				F.session("wx_auth_LastLoginIP",R.LastLoginIP);
				F.session("wx_auth_LoginTimes",R.LoginTimes+1);
				F.session("wx_access_flag",R.AccessFlag);
				F.goto("?m=Admin");
			}
		}
	}
});
/*用户退出，清理session*/
LoginController.extend("logout",function(){
	if(!is_empty(F.session("wx_auth_name"))){
		F.session("wx_auth_name","");
		F.session("wx_auth_LastLoginDate","");
		F.session("wx_auth_LastLoginIP","");
		F.session("wx_auth_LoginTimes","");
		F.session("wx_access_flag","");
		F.session("Id","");
	}
	F.goto("?m=Login&error=0&msg=" + F.encode("已退出;" + F.get("msg")));
});

/*生成验证码*/
LoginController.extend("code",function(){
	/*引用safecode库，引用成功后，F.exports.safecode就是一个函数，直接调用*/
	F.require("safecode");

	/*直接调用safecode方法*/
	F.exports.safecode("wx_session_code");
});
LoginController.extend("empty",function(a){
	F.goto("?m=" + Mo.Method + "&error=1&msg=" + F.encode("不支持的方法：" + a + "。"));
});
</script>