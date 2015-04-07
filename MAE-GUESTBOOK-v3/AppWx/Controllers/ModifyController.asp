<script language="jscript" runat="server">
/*创建一个Controller，用来响应地址：?m=Modify&xxxx*/
ModifyController = IController.create(function(){
	if(F.session("wx_auth_name")==""){
		F.goto("?m=Login&error=1&msg=" + F.encode("请登录。"));
		return false;
	}else{
		this.assign("subtitle","修改账号密码");
	}
});

/*显示修改用户名密码的页面*/
ModifyController.extend("Index",function(){
	this.assign("NameOld",F.session("wx_auth_name"));
	this.display("Admin:Modify");
});

/*修改用户名和密码*/
ModifyController.extend("modify",function(){
	var NameOld = F.post.exp("NameOld",/^\w+$/i),Name=F.post.exp("Name",/^\w+$/i);
	if(NameOld==""){
		F.goto("?m=Modify&error=1&msg=" + F.encode("原用户名错误"));
	}else if(Name==""){
		F.goto("?m=Modify&error=1&msg=" + F.encode("用户名错误"));
	}else if(F.session("wx_access_flag")!="0" && NameOld!=Name){
		F.goto("?m=Modify&error=1&msg=" + F.encode("您不能修改用户名。"));
	}else if(F.post("AuthOld")==""){
		F.goto("?m=Modify&error=1&msg=" + F.encode("必须输入原密码。"));
	}else{
		if(F.session("wx_access_flag")!="0"){
			Name = F.session("wx_auth_name");
			NameOld = Name;
		}
		var L = Model__("Authorize","Id").where("Name='" + NameOld + "'").query().fetch();
		if(L.eof()){
			F.goto("?m=Modify&error=1&msg=" + F.encode("用户不存在。"));
		}else{
			var R = L.read();
			if(R.AllowChangePwd==0){
				F.goto("?m=Modify&error=1&msg=" + F.encode("不允许修改账户信息。"));
				return;
			}
			var SHA1 = require("sha1");
			if(SHA1.SHA1(md5(SHA1.SHA2(F.post("AuthOld"))))!=R.Auth){
				F.goto("?m=Modify&error=1&msg=" + F.encode("原密码错误。"));
			}else{
				if(F.post("Auth")!=""){
					if(F.post("Auth")!=F.post("AuthRe")){
						F.goto("?m=Modify&error=1&msg=" + F.encode("两次密码输入不一致。"));
					}else{
						Model__("Authorize","Id").where("Name='" + NameOld + "'").update("Name",Name,"Auth",SHA1.SHA1(md5(SHA1.SHA2(F.post("Auth")))));
						F.goto("?m=Login&a=logout&error=0&msg=" + F.encode("用户修改成功，请牢记新密码。"));
					}
				}else{
					if(Name==NameOld){
						F.goto("?m=Modify&error=0&msg=" + F.encode("没有改变。"));
					}else{
						if(Model__("Authorize","Id").where("Name='" + Name + "'").query().fetch().eof()){
							Model__("Authorize","Id").where("Name='" + NameOld + "'").update("Name",Name);
							F.goto("?m=Login&a=logout&error=0&msg=" + F.encode("用户修改成功。"));
						}else{
							F.goto("?m=Modify&error=1&msg=" + F.encode("用户名已存在，没有改变。"));
						}
					}
				}
			}
		}
	}
});
ModifyController.extend("empty",function(a){
	F.goto("?m=" + Mo.Method + "&error=1&msg=" + F.encode("不支持的方法：" + a + "。"));
});
</script>