<script language="jscript" runat="server">
var F = F || (function(__PATH__) {
		var readTextFromFile = function(path, charset) {
			if (!$f.fso.fileexists(path)) return "";
			var byts, stream = Server.CreateObject("ADODB.STREAM");
			stream.mode = 3;
			stream.type=2;
			stream.CharSet = charset || "utf-8";
			stream.Open();
			stream.LoadFromFile(path);
			stream.Position = 0;
			byts = stream.ReadText();
			stream.Close();
			stream = null;
			return byts;
		};
		var $f = {PATH:[__PATH__]}, included__={},required__={},activex__=[];
		$f.TEXT = {
			BR: 1,
			NL: 2,
			BIN: 4,
			NLBR: 1 | 2
		};
		$f.fso = Server.CreateObject("Scripting.FileSystemObject");
		$f.exports = {};
		$f.vbs = {};
		$f.toString = function() {
			return "v1";
		};
		$f.exists = function(path, folder) {
			if (folder === true) {
				return $f.fso.folderexists($f.mappath(path));
			} else {
				return $f.fso.fileexists($f.mappath(path));
			}
		};
		$f.activex = function(classid, fn) {
			try {
				var $o = Server.CreateObject(classid);
				activex__.push($o);
				if (typeof fn == "function"){
					return fn.apply($o, [].slice.apply(arguments).slice(2)) || $o;
				}
				return $o;
			} catch (ex) {
				return null;
			}
		};
		$f.stream = function(mode, type) {
			var stream = $f.activex("Adodb.Stream");
			if (mode !== undefined) stream.Mode = mode;
			if (type !== undefined) stream.Type = type;
			return stream;
		};
		$f.extend = function(src) {
			if (arguments.length < 1) return {};
			if (arguments.length < 2) return src;
			for (var i = 1; i < arguments.length; i++) {
				for (var c in arguments[i]) {
					if (arguments[i].hasOwnProperty(c)) src[c] = arguments[i][c];
				}
			}
			return src;
		};
		$f.echo = function(debug, brnl, newline) {
			if ((brnl & $f.TEXT.BIN)) {
				Response.BinaryWrite(debug);
			} else {
				Response.Write(debug);
			}
			if (brnl === true) {
				Response.Write("<br />");
				if (newline !== false) Response.Write("\r\n");
				return;
			}
			if (isNaN(brnl)) return;
			if (brnl & $f.TEXT.BR) Response.Write("<br />");
			if (brnl & $f.TEXT.NL) Response.Write("\r\n");
		};
		$f.mappath = function(path) {
			if (path.length < 2) return Server.MapPath(path)
			if (path.substr(1, 1) == ":") return path;
			return Server.MapPath(path);
		};
		$f.require = function(library, path) {
			if (required__[library] === true) return;
			if (library.length > 2 && library.substr(1, 1) == ":" && $f.fso.fileexists(library)) {
				path = library.substr(0, library.lastIndexOf("\\") + 1);
				library = library.substr(library.lastIndexOf("\\") + 1);
			}
			if (!/^([\w\/\.\-]+)$/.test(library)) {
				throw "library '" + library + "' format error.";
				return null;
			}
			var _statement = "",
				_targetPaths = [],
				_path = "";
				
			if (path) _targetPaths = _targetPaths.concat(path);
			else _targetPaths = _targetPaths.concat(F.PATH);
			for (var i = 0; i < _targetPaths.length; i++) {
				_path = $f.mappath(_targetPaths[i] + library);
				if ($f.fso.fileexists(_path)) break;
				_path = $f.mappath(_targetPaths[i] + library + ".js");
				if ($f.fso.fileexists(_path)) break;
				if ($f.fso.folderexists($f.mappath(_targetPaths[i] + library))) {
					_path = $f.mappath(_targetPaths[i] + library + "/index.js");
					if ($f.fso.fileexists(_path)) break;
				}
			}
			if (_path=="" || !$f.fso.fileexists(_path)) {
				throw "required library '" + library + "' is not exists.";
				return $f.exports;
			}
			_statement = readTextFromFile(_path);
			_statement = _statement.replace(/^(\s*)<sc(.+)>/ig, "").replace(/<\/script>(\s*)$/ig, "");
			var this_ = this;
			if (this == F) this_ = null;
			required__[library] = true;
			return (new Function("exports", "__FILE__", "__DIR__", _statement))(
			this_ || $f.exports, _path, _path == "" ? "" : _path.substr(0, _path.lastIndexOf("\\"))) || $f.exports;
		};
		$f.include = function(path, charset) {
			if (included__[path] === true) return true;
			path = $f.mappath(path);
			if (!$f.fso.fileexists(path)) {
				throw "file not exists:" + path;
				return false;
			}
			var src = $f.string.fromFile(path, charset || "utf-8");
			src = src.replace(/^(\s*)<sc(.+)>/ig, "").replace(/<\/script>(\s*)$/ig, "");
			if (src == "") {
				throw "read file failed:" + path;
				return false;
			}
			if ($f.execute.call(path, src)) {
				return included__[path] = true;
			} else {
				return false;
			}
		};
		$f.execute = function() {
			if (arguments.length < 1) return false;
			var path = this;
			if (this == F) path = "";
			var dir = path == "" ? "" : path.substr(0, path.lastIndexOf("\\"));
			var args, src = (args = [].slice.apply(arguments)).shift();
			var __FILE__ = path,
				__DIR__ = dir;
			eval(src);
			var exports = exports || args;
			if (exports.constructor == Array && exports.length > 0) {
				for (var i = 0; i < exports.length; i++) {
					(new Function("sc", exports[i] + " = sc;"))(eval(exports[i]));
				}
			} else if (exports.constructor == String) {
				(new Function("sc", exports + " = sc;"))(eval(exports));
			}
			return true;
		};
		$f.random = function(minValue, maxValue) {
			if (minValue === undefined && maxValue === undefined) return Math.random();
			if (maxValue === undefined) {
				maxValue = minValue;
				minValue = 1;
			}
			return parseInt(Math.random() * (maxValue - minValue + 1)) + minValue;
		};
		$f.random.initialize = function(seeds, length) {
			if (seeds.length <= 0) return "";
			if (isNaN(length)) {
				ExceptionManager.put(0x000001A9, "F.random.initialize", "argument 'length' must be a number.");
				return "";
			}
			length = parseInt(length);
			var returnValue = "";
			for (var i = 0; i < length; i++) {
				returnValue += seeds.substr($f.random(0, seeds.length - 1), 1);
			}
			return new String(returnValue);
		};
		$f.foreach = function(src, fn, state) {
			if (typeof fn != "function") return;
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				if (fn.apply(src, [i, src[i], state]) === false) break;
			}
		};
		$f.foreach({
			"number": "123456789012345678901234567890",
			"letter": "abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH",
			"hex": "123456789012345678901234567890ABCDEFABCDEFABCDEFABCDEFABCDEF",
			"word": "abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH12345678906789012678901234534567890126789012345345",
			"mix": "~!@#$%^&*()_+=-[]{}:'<>/?\\,.|`abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH6789012678901234534567890126789012345345"
		}, function(i, v) {
			$f.random[i] = function(length) {
				return $f.random.initialize(v, length);
			};
		});
		$f.encode = function(src) {
			src = src || "";
			return encodeURIComponent(src).replace(/\+/, "%2B");
		};
		$f.decode = function(src) {
			src = src || "";
			return decodeURIComponent(src);
		};
		$f.format = function(Str) {
			var arg = arguments;
			if (arg.length <= 1) {
				return Str;
			}
			return Str.replace(/\{(\d+)(\.([\w\.\-]+))?(:(.+?))?\}/igm, function(ma) {
				var match = /\{(\d+)(\.([\w\.\-]+))?(:(.+?))?\}/igm.exec(ma);
				if (match && match.length == 6) {
					var argvalue = arg[parseInt(match[1]) + 1];
					if (argvalue === undefined) return "";
					if (argvalue==null) return "NULL";
					return argvalue;
				}
				return ma;
			});
		};
		$f.base64 = (function() {
			var base64keyStr_ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var encode_ = function(Str) {
					var output = "";
					var chr1, chr2, chr3 = "";
					var enc1, enc2, enc3, enc4 = "";
					var i = 0;
					do {
						chr1 = Str[i++];
						chr2 = Str[i++];
						chr3 = Str[i++];
						enc1 = chr1 >> 2;
						enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
						enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
						enc4 = chr3 & 63;
						if (isNaN(chr2)) {
							enc3 = enc4 = 64;
						} else if (isNaN(chr3)) {
							enc4 = 64;
						}
						output = output + base64keyStr_.charAt(enc1) + base64keyStr_.charAt(enc2) + base64keyStr_.charAt(enc3) + base64keyStr_.charAt(enc4);
						chr1 = chr2 = chr3 = "";
						enc1 = enc2 = enc3 = enc4 = "";
					} while (i < Str.length);
					return output;
				};
			var decode_ = function(Str) {
					var output = [];
					var chr1, chr2, chr3 = "";
					var enc1, enc2, enc3, enc4 = "";
					var i = 0;
					do {
						enc1 = base64keyStr_.indexOf(Str.charAt(i++));
						if(enc1<0)continue;
						enc2 = base64keyStr_.indexOf(Str.charAt(i++));
						if(enc2<0)continue;
						enc3 = base64keyStr_.indexOf(Str.charAt(i++));
						if(enc3<0)continue;
						enc4 = base64keyStr_.indexOf(Str.charAt(i++));
						if(enc4<0)continue;
						chr1 = (enc1 << 2) | (enc2 >> 4);
						chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
						chr3 = ((enc3 & 3) << 6) | enc4;
						output.push(chr1);
						if (enc3 != 64) {
							output.push(chr2);
						}
						if (enc4 != 64) {
							output.push(chr3);
						}
						chr1 = chr2 = chr3 = "";
						enc1 = enc2 = enc3 = enc4 = "";
					} while (i < Str.length);
					return output;
				};
			var $node = $f.activex("Microsoft.XMLDOM", function() {
				this.loadXML("<?xml version=\"1.0\" encoding=\"gb2312\"?><root xmlns:dt=\"urn:schemas-microsoft-com:datatypes\"><data dt:dt=\"bin.base64\"></data></root>");
				return this.selectSingleNode("//root/data");
			}),
				$base64 = {};
			$base64.e = encode_;
			$base64.d = decode_;
			$base64.encode = function(Str) {
				if (typeof Str == "string") Str = $f.string.getByteArray(Str);
				return encode_(Str);
			};
			$base64.decode = function(Str) {
				return $f.string.fromByteArray(decode_(Str));
			};
			$base64.toBinary = function(str) {
				$node.text = str;
				return $node.nodeTypedValue;
			};
			$base64.fromBinary = function(str) {
				$node.nodeTypedValue = str;
				return $node.text;
			};
			return $base64;
		})();
		$f.string = {};
		$f.string.left = function(src, len) {
			src = src || "";
			if (typeof len == "number") {
				if (src.length <= len) return src;
				return src.substr(0, len);
			}
			if (typeof len == "string") {
				if (src.indexOf(len) < 0) return src;
				return src.substr(0, src.indexOf(len));
			}
			return src;
		};
		$f.string.right = function(src, len) {
			src = src || "";
			if (typeof len == "number") {
				if (src.length <= len) return src;
				return src.substr(src.length - len);
			}
			if (typeof len == "string") {
				if (src.indexOf(len) < 0) return src;
				return src.substr(src.lastIndexOf(len) + len.length);
			}
			return src;
		};
		$f.string.startWith = $f.string.startsWith = function(src, opt) {
			if (src == "") return false;
			if (opt === undefined) return false;
			if (opt.length > src) return false;
			if (src.substr(0, opt.length) == opt) return true;
			return false;
		};
		$f.string.endWith = $f.string.endsWith = function(src, opt) {
			if (src == "") return false;
			if (opt === undefined) return false;
			if (opt.length > src) return false;
			if (src.substr(src.length - opt.length) == opt) return true;
			return false;
		};
		$f.string.trim = function(src, opt) {
			return $f.string.trimLeft($f.string.trimRight(src, opt), opt);
		};
		$f.string.trimLeft = function(src, opt) {
			if (src == "") return "";
			if (opt === undefined) return src.replace(/^(\s+)/igm, "");
			if ($f.string.startWith(src, opt)) {
				if (src == opt) return "";
				return $f.string.trimLeft(src.substr(opt.length), opt);
			}
			return src;
		};
		$f.string.trimRight = function(src, opt) {
			if (src == "") return "";
			if (opt === undefined) return src.replace(/(\s+)$/igm, "");
			if ($f.string.endWith(src, opt)) {
				if (src == opt) return "";
				return $f.string.trimRight(src.substr(0, src.length - opt.length), opt);
			}
			return src;
		};
		$f.string.format = function() {
			return $f.format.apply(F, arguments);
		};
		$f.string.email = function(str) {
			return $f.string.exp(str, /^([\w\.\-]+)@([\w\.\-]+)$/);
		};
		$f.string.url = function(str) {
			return $f.string.exp(str, /^http(s)?\:\/\/(.+?)$/i);
		};
		$f.string.test = function(str, exp, option) {
			exp = $f.string.exp_(exp, option);
			if (exp == null) return false;
			return exp.test(str);
		};
		$f.string.replace = function(src, exp, option, replacement) {
			if (arguments.length == 3) {
				replacement = option;
				option = "";
			}
			src = src || "";
			if (typeof exp != "object") {
				exp = exp + "";
				exp = $f.string.exp_(exp, option) || exp;
			}
			return src.replace(exp, replacement);
		};
		$f.string.matches = function(src, exp, option,fn) {
			var ref=null;
			if(typeof option=="function")
			{
				if(fn) ref = fn;
				fn = option;
				option = ""; 
			}
			exp = $f.string.exp_(exp, option);
			if (exp == null) return null;
			if (!exp.global) return exp.exec(src);
			var ret = [],
				result = exp.exec(src);
			while (result) {
				if(typeof fn=="function")
				{
					fn.apply(ref || result,result);
				}
				else
				{
					ret.push(result);
				}
				result = exp.exec(src);
			}
			return ret;
		};
		$f.string.exp = function(str, exp, option) {
			if (typeof exp != "object") {
				if (typeof exp !== "string") return "";
				exp = $f.string.exp_(exp, option);
				if (exp == null) return "";
			}
			str = str || "";
			return (exp.test(str) ? str : "");
		};
		$f.string.exp_ = function(exp, option) {
			if (typeof exp == "object") return exp;
			option = option || "";
			if (!/^\/(.+)\/([igm]*)$/.test(exp)) exp = "/" + exp + "/" + option;
			try {
				return (new Function("return " + exp + ";"))()
			} catch (ex) {
				ExceptionManager.put(ex, "F.string.exp_");
				return null;
			}
			return exp;
		};
		$f.string.fromBinary = function(bin, charset) {
			var byts, stream = $f.stream(3, 1);
			stream.Open();
			stream.Write(bin);
			stream.Position = 0;
			stream.Type = 2;
			stream.CharSet = charset || "utf-8";
			byts = stream.ReadText();
			stream.Close();
			stream = null;
			return byts;
		};
		$f.string.fromFile = function(path, charset) {
			if (!$f.fso.fileexists(path)) return "";
			var byts, stream = $f.stream(3, 2);
			stream.CharSet = charset || "utf-8";
			stream.Open();
			stream.LoadFromFile(path);
			stream.Position = 0;
			byts = stream.ReadText();
			stream.Close();
			stream = null;
			return byts;
		};
		$f.string.saveToFile = function(path, content, charset) {
			var byts, stream = $f.stream(3, 2);
			stream.CharSet = charset || "utf-8";
			stream.Open();
			stream.writetext(content)
			stream.savetofile(path, 2);
			stream.Close();
			stream = null;
		};
		$f.string.appendToFile = function(path, content, charset) {
			var byts, stream = $f.stream(3, 2);
			stream.CharSet = charset || "utf-8";
			stream.Open();
			if (!$f.fso.fileexists(path)) {
				stream.LoadFromFile(path);
				stream.Position = stream.Size;
			}
			stream.writetext(content)
			stream.savetofile(path, 2);
			stream.Close();
			stream = null;
		};
		$f.string.getByteArray = function(string) {
			if (string == "") return [];
			var enc = $f.encode(string);
			var byteArray = [];
			for (var i = 0; i < enc.length; i++) {
				if (enc.substr(i, 1) == "%") {
					byteArray.push(parseInt(enc.substr(i + 1, 2), 16));
					i += 2;
				} else {
					byteArray.push(enc.charCodeAt(i));
				}
			}
			return byteArray;
		};
		$f.string.fromByteArray = function(byteArray) {
			if (byteArray.constructor != Array || byteArray.length <= 0) return "";
			var string = "";
			for (var i = 0; i < byteArray.length; i++) {
				string += "%" + byteArray[i].toString(16);
			}
			return $f.decode(string);
		};
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
				    var pathinfo = __PATH__ + lib + ".vbs";
				    if(!$f.fso.fileexists($f.mappath(pathinfo)))
				    {
						ExceptionManager.put(0x00002CD, "F.vbs.include(lib)","待加载的类库'" + lib + "'不存在。");
					    return false;
				    }else{
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
				    }
			    };
		    })(objScrCtl);
		    objScrCtl = null;
	    }catch(ex){}
		return $f;
	})("utils/"), 
	exports = F.exports, 
	require = function(){return F.require.apply(F,arguments);},
	include = function(){return F.include.apply(F,arguments);},
	echo = F.echo,
	ECHO_FORMAT = F.TEXT,
	IO = require("io"),
	JSON = require("json"),
	ExceptionManager = {
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
	},
	Exception = function(number,source,message){
		this.Number = number || 0;
		if(this.Number < 0)this.Number = Math.pow(2,32) + this.Number;
		this.Source = source || "";
		this.Message = message || "";
		this.Description = message || "";
	};
</script>