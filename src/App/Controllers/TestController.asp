<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
TestController = IController.create(
	function(){
		this.Name="我来自另外的Controller！";
	}
); 

/*
** 为新Controller对象扩展一个新方法，对应相应的动作；
** 语法：newController.extend(funcName,callback);
** funcName：方法名；
** callback：要执行的函数；
*/
TestController.extend("Index",function(){
	return this.Name;
});
TestController.extend("Show",function(){
	/*statement*/
});
TestController.extend("Test",function(){
	/*todo*/
	var getfunction=function(fn){
		var s = fn.toString();
		return s.replace(/^function(\s(.+?))?\((.*?)\)([\s\S]+)$/,"($3)");
	};
	var parser = function(src,name){
		F.echo("<pre>");
		var members={};
		if(typeof src == "object"){
			var $F = F.object.sort(src);
			for(var i in $F){
				if(!$F.hasOwnProperty(i))continue;
				if(typeof $F[i] == "object"){
					for(var j in $F[i]){
						if(!$F[i].hasOwnProperty(j))continue;
						if(typeof $F[i][j] == "function"){
							members[name + "." + i + "." + j] = name + "." + i + "." + j + getfunction($F[i][j]) +"[静态方法]";
						}else{
							members[name + "." + i + "." + j] = name + "." + i + "." + j +"[静态属性]";
						}
					}
				}else if(typeof $F[i] == "function"){
					members[name + "." + i] = name + "." + i + getfunction($F[i]);
					for(var j in $F[i]){
						if(!$F[i].hasOwnProperty(j))continue;
						if(typeof $F[i][j] == "function"){
							members[name + "." + i + "." + j] = name + "." + i + "." + j + getfunction($F[i][j]) +"[静态方法]";
						}else{
							members[name + "." + i + "." + j] = name + "." + i + "." + j +"[静态属性]";
						}
					}
					for(var j in $F[i].prototype){
						if(!$F[i].prototype.hasOwnProperty(j))continue;
						if(typeof $F[i].prototype[j] == "function"){
							members[name + "." + i + "." + j] = name + "." + i + "." + j + getfunction($F[i].prototype[j]);
						}else{
							members[name + "." + i + "." + j] = name + "." + i + "." + j;
						}
					}
				}else{
					members[name + "." + i] = name + "." + i;
				}
			}
		}else if(typeof src=="function"){
			members[name] = name + getfunction(src);
			for(var j in src){
				if(!src.hasOwnProperty(j))continue;
				if(typeof src[j] == "function"){
					members[name + "." + j] = name + "." + j + getfunction(src[j]) +"[静态方法]";
				}else{
					members[name + "." + j] = name + "." + j + "[静态属性]";
				}
			}
			for(var j in src.prototype){
				if(!src.prototype.hasOwnProperty(j))continue;
				if(typeof src.prototype[j] == "function"){
					members[name + "." + j] = name + "." + j + getfunction(src.prototype[j]);
				}else{
					members[name + "." + j] = name + "." + j;
				}
			}
		}
		members = F.object.sort(members);
		for(var i in members){
			if(!members.hasOwnProperty(i))continue;
			F.echo(members[i],F.TEXT.NL);
		}
		F.echo("</pre>");
	}
	parser(F,"F");
	parser(Mo,"Mo");
	parser(Model__,"Model__");
	parser(__Model__,"Model__");
	parser(DataTable,"DataTable");
	parser(DataTableRow,"DataTableRow");
	parser(IClass,"IClass");
	parser(IController,"IController");
	parser(ExceptionManager,"ExceptionManager");
	parser(Exception,"Exception");
	parser(ModelCMDManager,"ModelCMDManager");
});
TestController.extend("empty",function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>