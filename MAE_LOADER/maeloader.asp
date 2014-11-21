<script language="jscript" runat="server">
var JsLoader = JsLoader || (function(__PATH__) {
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
		var $f = {PATH:[__PATH__]}, included__={},required__={};
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
			else _targetPaths = _targetPaths.concat(JsLoader.PATH);
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
			if (this == JsLoader) this_ = null;
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
			if (this == JsLoader) path = "";
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
		return $f;
	})("utils/"), 
	exports = JsLoader.exports, 
	require = function(){return JsLoader.require.apply(JsLoader,arguments);},
	include = function(){return JsLoader.include.apply(JsLoader,arguments);},
	echo = JsLoader.echo;
	ECHO_FORMAT = JsLoader.TEXT;
</script>