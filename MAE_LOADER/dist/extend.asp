<script language="jscript" runat="server">
/*
** File: exception_mgr.asp
** Usage: define some necessary class for MAE.
** Detail:
**		ExceptionManager, manage all the exception in MAE.
**		Exception, exception object.
** About: 
**		support@mae.im
*/
var exports = F.exports, 
	require = function(){return F.require.apply(F,arguments);},
	include = function(){return F.include.apply(F,arguments);},
	echo = F.echo,
	ECHO_FORMAT = F.TEXT,
	IO = require("io"),
	JSON = require("json");
(function($f){
	try{
	    var objScrCtl = $f.activex("MSScriptControl.ScriptControl");
	    objScrCtl.Language = "VBScript";
	    objScrCtl.AddObject("F",$f);
	    objScrCtl.AddObject("Request",Request);

	    objScrCtl.ExecuteStatement(
	    	"function charcodeb(b)\r\n" +
	    	"	charcodeb = ascb(b)\r\n" +
	    	"end function\r\n"
	    );
	    
	    (function(ScrCtl){
		    var required__={};
		    $f.vbs.ctrl=ScrCtl;
	   		$f.vbs.eval = function(script){
		   		return ScrCtl.eval(script);
	   		};
	   		$f.vbs.execute = function(script){
		   		ScrCtl.ExecuteStatement(script);
	   		};
	   		$f.vbs.ascb = function(b){
		   		return ScrCtl.Run("charcodeb",b);
	   		};
	   		$f.vbs.ns = function(name,value){
		   		ScrCtl.AddObject(name,value);
	   		};
		    $f.vbs.run = function(){
			    var args = [];for(var i = 0;i < arguments.length;i++)args.push("args" + i);var args_ = args.join(",");
			    return (new Function(args_,"return this.Run(" + args_ + ");")).apply(ScrCtl,arguments);
		    };
		    $f.vbs.require = function(name){
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
		    $f.vbs.include = function(lib){
			    if(!/^([\w\.\/]+)$/.test(lib)){
					ExceptionManager.put(0x00003CD,"F.vbs.include(lib)","Parameter 'lib' is invalid.");
				    return false;
			    }
				if (required__["vbs-"+lib] === true) return true;
			    var pathinfo = Mo.Config.Global.MO_APP + "Library/Extend/" + lib + ".vbs";
			    if(!$f.fso.fileexists($f.mappath(pathinfo)))
			    {
				    pathinfo = Mo.Config.Global.MO_CORE + "Library/Extend/" + lib + ".vbs";
				    if(!$f.fso.fileexists($f.mappath(pathinfo)))
				    {
						ExceptionManager.put(0x00002CD, "F.vbs.include(lib)","待加载的类库'" + lib + "'不存在。");
					    return false;
				    }
		    	}
			    var ret = IO.file.readAllText($f.mappath(pathinfo));
				$f.vbs.ctrl.error.clear();
				$f.vbs.execute(ret);
				if($f.vbs.ctrl.error.number != 0){ 
					ExceptionManager.put($f.vbs.ctrl.error.number,"$f.vbs.include(lib)",$f.vbs.ctrl.error.description);
					$f.vbs.ctrl.error.clear();
					return false;
				}else{
					required__["vbs-"+lib]=true;
					return true;
				}
		    };
	    })(objScrCtl);
	    objScrCtl = null;
    }catch(ex){ExceptionManager.put(ex,"F.vbs");}
})(F);
var ExceptionManager = {
	exceptions : [],
	put : function(exception_){
		if(arguments.length == 1){
			ExceptionManager.exceptions.push(exception_);
		}else if(arguments.length == 2){
			ExceptionManager.exceptions.push(new Exception(arguments[0].number & 0xffff,arguments[1],arguments[0].description));
		}else if(arguments.length == 3){
			ExceptionManager.exceptions.push(new Exception(arguments[0],arguments[1],arguments[2]));
		}
	},
	clear : function(){
		while(ExceptionManager.exceptions.length > 0)ExceptionManager.exceptions.pop();
	},
	debug : function(){
		var returnValue = "";
		for(var i = 0;i < ExceptionManager.exceptions.length;i++){
			var exception_ = ExceptionManager.exceptions[i];
			returnValue += F.format("[0x{0:X8}] {1} : {2}<br />",exception_.Number,exception_.Source,exception_.Description);
		}
		return returnValue;
	}
};

function Exception(number,source,message){
	this.Number = number || 0;
	if(this.Number < 0)this.Number = Math.pow(2,32) + this.Number;
	this.Source = source || "";
	this.Message = message || "";
	this.Description = message || "";
}
</script>