<script language="jscript" runat="server">
/*
** 创建一个新的Controller对象；
** 语法：newController = IController.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
MpiController = IController.create();
MpiController.extend("Index", function(){
	var modules = Mpi.fetchPackagesList();
	for(var i=0;i<modules.length;i++){
		var pkg = Mpi.packageExists(modules[i]);
		if(pkg==null){
			modules[i].exists = -1;
			if(Mpi.message == ""){
				modules[i].exists = 0;
			}else{
				modules[i].e = Mpi.message;
			}
		}else{
			modules[i].exists = 1;
			if(pkg.version!=modules[i].version){
				modules[i].exists = 2;
				modules[i].e = pkg.version;
			}
		}
	}
	this.assign("modules", modules);
	this.display("Home:Mpi");
});
MpiController.extend("Install", function(){
	var pkgname = F.get.exp("pkgname",/^\w+$/i);
	if(Mpi.downloadAndInstall(pkgname,{update : F.get("update")=="yes"})){
		this.assign("result", "module '" + pkgname + "' was installed.");
	}else{
		this.assign("result", "can not install module '" + pkgname + "'. (" + Mpi.message + ")");
	}
	this.display("Home:MpiInstall");
});
MpiController.extend("empty", function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>