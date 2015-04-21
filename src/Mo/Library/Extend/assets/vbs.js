/*
** File: vbs.js
** Usage: use some vbs methods
** About: 
**		support@mae.im
*/
var VBS = {
	_cache:{}
};
try{
	//为了一些必要的功能，不得不调用部分VBS的东西
    var objScrCtl = F.activex("MSScriptControl.ScriptControl");
    objScrCtl.Language = "VBScript";
    objScrCtl.AddObject("F", F);
    objScrCtl.AddObject("Mo", Mo);
    objScrCtl.AddObject("Request", Request);

    objScrCtl.ExecuteStatement(
    	"function charcodeb(b)\r\n" +
    	"	charcodeb = ascb(b)\r\n" +
    	"end function\r\n"
    );
    
    /*如下仅仅是利用VBS扩展功能*/
    (function(ScrCtl){
	    VBS.ctrl=ScrCtl;
   		VBS.eval = function(script){
	   		return ScrCtl.eval(script);
   		};
   		VBS.execute = function(script){
	   		ScrCtl.ExecuteStatement(script);
   		};
   		VBS.ascb = function(b){
	   		return ScrCtl.Run("charcodeb",b);
   		};
   		VBS.ns = function(name,value){
	   		ScrCtl.AddObject(name,value);
   		};
   		VBS.getref = function(func){
	   		return ScrCtl.eval("GetRef(\"" + func + "\")");
   		};
	    VBS.run = function(){
		    var args = [];for(var i = 0;i < arguments.length;i++)args.push("args" + i);var args_ = args.join(",");
		    var result = (new Function(args_,"return this.Run(" + args_ + ");")).apply(ScrCtl,arguments);
		    return result;
	    };
	    VBS.require = function(name){
		    return (function(args){
			    var obj = ScrCtl.eval("new " + name);
			    if(args.length>0 && args.length % 2==0){
				    for(var i=0;i<args.length-1;i++){
					    obj[args[i]]=args[++i];
				    }
			    }else if(args.length==1 && typeof args[0]=="object"){
				    for(var i in args[0]){
					    if(!args[0].hasOwnProperty(i))continue;
					    obj[i]=args[0][i];
				    }
			    }
			    return obj;
			})(Array.prototype.slice.call(arguments,1));
	    };
	    VBS.include = function(lib){
		    var pathinfo="";
		    if(lib.indexOf(":")==1){
		   		pathinfo = F.mappath(lib);
	    	}else{
		    	pathinfo = Mo.Config.Global.MO_APP + "Library/Extend/" + lib + ".vbs";
			    if(!IO.file.exists(pathinfo)) pathinfo = Mo.Config.Global.MO_CORE + "Library/Extend/" + lib + ".vbs";
	    	}
	    	if(!pathinfo || !IO.file.exists(pathinfo))
		    {
				ExceptionManager.put(0x00002CD, "VBS.include(lib)","待加载的类库'" + lib + "'不存在。");
			    return false;
		    }
			if(!VBS._cache.hasOwnProperty(lib)){
			    var ret = IO.file.readAllText(F.mappath(pathinfo));
				VBS.ctrl.error.clear();
				VBS.execute(ret);
				if(VBS.ctrl.error.number != 0){ 
					ExceptionManager.put(VBS.ctrl.error.number,"VBS.include(lib)",VBS.ctrl.error.description);
					VBS.ctrl.error.clear();
					return false;
				}else{
					VBS._cache[lib]=true;
					return true;
				}
		    }else{
			   return true; 
		    }
	    };
    })(objScrCtl);
    objScrCtl = null;
}catch(ex){
    ExceptionManager.put(ex,"VBS::init",E_WARNING);
    VBS = null;
}
module.exports = VBS;