/*
** File: dump.js
** Usage: show variable detail
** About: 
**		support@mae.im
*/

var dumpHelper__ = function(l) {
		var returnValue = "";
		for (var i = 0; i < l; i++) returnValue += "  ";
		return returnValue;
	};
var dump__ = function(parm, level) {
		if (level === undefined) level = 1;
		if (parm === undefined) return "undefined";
		//constructor
		switch (typeof parm) {
		case "string":
			return "string(\"" + parm.replace(/\r/ig,"\\r").replace(/\n/ig,"\\n").replace(/\t/ig,"\\t") + "\")";
		case "number":
			return "number(" + parm.toString() + ")";
		case "boolean":
			return "boolean(" + parm.toString() + ")";
		case "date":
			return "date(" + (new Date(parm)).toString() + ")";
		case "function":
			return "function" + parm.toString().replace(/^function([^\(]+?)?(\((.*?)\))([\s\S]+)$/i,"$2");
		}
		if (parm === null) return "NULL";
		if (typeof parm == "object") {
			if ((parm instanceof ActiveXObject) && (typeof(parm.Count) == "number") && (typeof(parm.Keys) == "unknown") && (typeof(parm.Items) == "unknown") && (typeof(parm.Key) == "unknown") && (typeof(parm.Item) == "unknown")) {
				var returnValue = "dictionary{\r\n";
				F.each(parm, function(i) {
					returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this(i), level + 1) + "\r\n";
				});
				returnValue += dumpHelper__(level - 1) + "}";
				return returnValue;
			}
			if (parm instanceof ActiveXObject){
				return "[ActiveXObject]";
			}
			if (parm.constructor == Date) {
				return "date(" + parm.toString() + ")";
			}
			if (parm.constructor == Array) {
				var returnValue = "array(" + parm.length + "){\r\n";
				var len = parm.length;
				for(var i=0;i<len;i++){
					returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(parm[i], level + 1) + "\r\n";
				}
				returnValue += dumpHelper__(level - 1) + "}";
				return returnValue;
			}
			if (parm.constructor == Object) {
				var returnValue = "object{\r\n";
				F.foreach(parm, function(i) {
					returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
				});
				returnValue += dumpHelper__(level - 1) + "}";
				return returnValue;
			}
			if (parm.toString() == "[object Object]") {
				if (parm.constructor == DataTable) {
					var returnValue = "DataTable{\r\n";
					returnValue += dumpHelper__(level) + "[pagesize] => " + dump__(parm.pagesize, level + 1) + ",\r\n";
					returnValue += dumpHelper__(level) + "[recordcount] => " + dump__(parm.recordcount, level + 1) + ",\r\n";
					returnValue += dumpHelper__(level) + "[currentpage] => " + dump__(parm.currentpage, level + 1) + ",\r\n";
					returnValue += dumpHelper__(level) + "[LIST__] => " + dump__(parm["LIST__"], level + 1) + "\r\n";
					returnValue += dumpHelper__(level - 1) + "}";
					return returnValue;
				}
				if (parm.constructor == DataTableRow) {
					var returnValue = "DataTableRow{\r\n";
					returnValue += dumpHelper__(level) + "[pk] => " + dump__(parm.pk, level + 1) + ",\r\n";
					returnValue += dumpHelper__(level) + "[table] => " + dump__(parm.table, level + 1) + "\r\n";
					returnValue += dumpHelper__(level - 1) + "}";
					return returnValue;
				}
				var returnValue = "[object Object]{\r\n";
				F.foreach(parm, function(i) {
					returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
				});
				F.foreach(parm.constructor.prototype, function(i) {
					returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
				});
				returnValue += dumpHelper__(level - 1) + "}";
				return returnValue;
			}
		}
		if (typeof parm == "unknown") {
			try{
				if (parm.constructor == VBArray) {
					var returnValue = "array{\r\n";
					F.foreach((new VBArray(parm)).toArray(), function(i) {
						returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
					});
					returnValue += dumpHelper__(level - 1) + "}";
					return returnValue;
				}
			}catch(ex){
				return "unknown(" + parm + ")";
			}
		}
		return "unknown(object)";
	};
var $dump = F.dump = function(parm, returnValue) {
	var value = dump__(parm, 1);
	if (returnValue === true) return value;
	F.echo("<pre>" + value + "</pre>");
};
F.post.dump = function(returnValue) {
	var dump = dump__(F.post(), 1);
	if (returnValue === true) return dump;
	F.echo(dump);
};
F.get.dump = function(returnValue) {
	var dump = dump__(F.get(), 1);
	if (returnValue === true) return dump;
	F.echo(dump);
};
F.session.dump = function(returnValue) {
	var dump = ("session{\n");
	dump += ("  [Timeout] => " + dump__(Session.Timeout) + "\n");
	dump += ("  [CodePage] => " + dump__(Session.CodePage) + "\n");
	dump += ("  [LCID] => " + dump__(Session.LCID) + "\n");
	dump += ("  [SessionID] => " + dump__(Session.SessionID) + "\n");
	dump += ("  [Contents] => {\n");
	F.each(Session.Contents, function(q) {
		var nq = q;
		if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) nq = F.string.trimLeft(q, Mo.Config.Global.MO_APP_NAME + "_");
		dump += ("    [" + nq + "] => " + dump__(Session.Contents(q)) + "\n");
	});
	dump += ("  }\n");
	dump += ("}");
	if (returnValue === true) return dump;
	F.echo(dump);
}
module.exports = $dump;