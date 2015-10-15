/*
 ** File: view.js
 ** Usage: parse template to jscript codes.
 ** About:
 **		support@mae.im
 */
function replacementter(src, starts, ends, callback, state) {
	var regexp = new RegExp(starts + "((.*?)[^\\\\])?" + ends, "ig");
	return src.replace(regexp, function($0, $1) {
		return callback.call(state, $1, starts, ends)
	});
};

function readAttrs__(src) {
	if (typeof src != "string") return {};
	if (!src) return {};
	src = F.string.trim(F.string.trim(src).replace(/^<(\w+)([\s\S]+?)(\/)?>([\s\S]*?)$/i, "$2"));
	var returnValue = {};
	var reg = /\b([\w\.]+)\=(\"|\')(.+?)(\2)( |$)/igm;
	var a = reg.exec(src);
	while (a != null) {
		returnValue[a[1]] = a[3];
		a = reg.exec(src);
	}
	return returnValue;
};

function checkassign(val) {
	try {
		(new Function("return " + val + ";"))();
	} catch (ex) {
		return true;
	}
	return false;
}
var G = Mo.Config.Global;
var REGEXP = {
	LOOP: /<loop ([\w\.]+)(\="(((\w+) as )?(\w+))")?>/ig,
	FOR: /<for ([\w\.]+)(\="(((\w+) as )?(\w+))")?>/i,
	FOREACH: /<foreach ([\w\.]+)(\="(((\w+) as )?(\w+))")?>/i,
	FOREACH2: /<foreach2 ([\w\.]+)(\="(((\w+) as )?(\w+))")?>/i
};

function MoAspEnginerView() {
	this.mvarDicts = {};
	this.Content = "";
	this.loops = ";";
	this.assigns = "";
}
MoAspEnginerView.compile = function(content) {
	var _view = new MoAspEnginerView();
	_view.setContent(content).parse();
	return _view.Content;
};
MoAspEnginerView.prototype.setContent = function(content) {
	if (!content) return this;
	F.string.matches(content, /<literal>([\s\S]*?)<\/literal>/ig, function($0, $1) {
		var id = this.getRndid();
		this.mvarDicts[id] = $1;
		content = content.replace($0, "<$literalid=" + id + "/$>");
	}, this);
	content = content.replace(/(\s*)\<\!\-\-\/\/(.*?)\-\-\>(\s*)/ig, "");
	content = content.replace(/(\s*)\<\!\-\-\/\*([\s\S]*?)\*\/\-\-\>(\s*)/ig, "");
	content = F.string.replace(content, /<switch(.+?)>(\s*)<case/igm, "<switch$1><case");
	content = F.string.replace(content, /\n/igm, "--movbcrlf--");
	content = F.string.replace(content, /\r/igm, "--movbcrlf--");
	content = F.string.replace(content, /\n/igm, "--movbcrlf--");
	if (G.MO_PREETY_HTML || G.MO_PRETTY_HTML) {
		content = F.string.replace(content, /(--movbcrlf--){1,}/igm, "--movbcrlf--");
	}
	content = F.string.replace(content, /--movbcrlf--/igm, "--movbcrlf--\n");
	this.Content = content;
	return this;
}
MoAspEnginerView.prototype.parse = function() {
	this.parsePreCombine();
	if (G.MO_TAG_LIB != "") {
		var libs = G.MO_TAG_LIB.split(","),
			lib, closetag, tagcontent, _len = libs.length;
		for (var i = 0; i < _len; i++) {
			lib = libs[i];
			closetag = true;
			tagcontent = "";

			var taglib = Mo.LoadAssets(lib);
			if (taglib) {
				var match, regexp = new RegExp("<" + lib + "\\b([\\s\\S]*?)>([\\s\\S]*?)<\\/" + lib + ">", "igm"),
					matches = F.string.matches(this.Content, regexp);
				if (matches && matches.length > 0) {
					closetag = false;
				} else {
					regexp = new RegExp("\\<" + lib + "\\b([\\s\\S]*?)\\/\\>", "igm");
					matches = F.string.matches(this.Content, regexp);
				}
				if (!matches) continue;
				while (matches.length > 0) {
					match = matches.pop();
					if (!closetag) tagcontent = match[2];
					while (this.Content.indexOf(match[0]) >= 0) {
						this.Content = this.Content.replace(match[0], taglib.Index(readAttrs__(match[1]), tagcontent))
					}
				}
			}
		}
	}
	this.parseSource();
	this.parseHtmlHelper();
	this.parsePage();
	this.parseVari(["#", "@", "$"]);
	this.parseLoop();
	this.parseForeach();
	this.parseEmpty();
	this.parseSwitch();
	this.parseCompare(["lt", "gt", "nlt", "ngt", "eq", "neq"]);
	this.parseExpression();
	this.parseExpressionElse();
	this.Content = F.string.replace(this.Content, /<(and|or)(.+?)\/>/igm, "")
	this.Content = F.string.replace(this.Content, /<\/else>/igm, "{?MoAsp }else{ MoAsp?}");
	this.Content = F.string.replace(this.Content, /<else \/>/igm, "{?MoAsp }else{ MoAsp?}");
	this.Content = F.string.replace(this.Content, /<break \/>/igm, "{?MoAsp break; MoAsp?}");
	this.Content = F.string.replace(this.Content, /<\/switch>/igm, "{?MoAsp } MoAsp?}");
	this.Content = F.string.replace(this.Content, /<default \/>/igm, "{?MoAsp default : MoAsp?}");
	this.Content = F.string.replace(this.Content, /<\/(n)?(eq|empty|lt|gt|expression|eof|foreach)>/igm, "{?MoAsp } MoAsp?}");
	this.parseVari("");
	this.parseAssignName();
	this.parseMoAsAsp();
	this.doSomethingToAsp();
	return this;
}


MoAspEnginerView.prototype.parseMoAsAsp = function() {
	F.string.matches(this.Content, /\{\?MoAsp(?:[\s\S]*?)MoAsp\?\}/igm, function($0) {
		var id = this.getRndid();
		this.mvarDicts[id] = $0;
		this.Content = F.replace(this.Content, $0, "{?MoAsp" + id + "MoAsp?}");
	}, this);
	this.Content = this.Content.replace(/--movbcrlf--/g, "\n");
	this.Content = this.Content.replace(/(\n){2,}/g, "\n");
	this.Content = this.Content.replace(/^(.+?)$/gm, function($0){
		if(/^\{\?MoAsp(\w{10})MoAsp\?\}$/.test($0) || /^\<\$literalid\=(\w+?)\/\$\>$/.test($0)){
			return $0;
		}else{
			var data = $0.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
			if (G.MO_PREETY_HTML || G.MO_PRETTY_HTML) {
				data = data.replace(/(^(\s+)|(\s+)$)/, "");
			}
			data = data.replace(/\{\?MoAsp(\w{10})MoAsp\?\}/g, '");\n{?MoAsp$1MoAsp?}\n_echo("');
			data = data.replace(/\<\$literalid\=(\w+?)\/\$\>/g, '");\n<$literalid=$1/$>\n_echo("');
			return '_echo("' + data + '!--movbcrlf--!");';
		}
	});
	if (G.MO_PREETY_HTML || G.MO_PRETTY_HTML) {
		this.Content = this.Content.replace(/\!--movbcrlf--\!/g, "");
		this.Content = this.Content.replace(/"\);\n_echo\("/igm, "");
	}else{
		this.Content = this.Content.replace(/\!--movbcrlf--\!/g, "\\r\\n");
	}
	var that = this;
	this.Content = this.Content.replace(/^(.+?)$/gm, function($0){
		var mat;
		if(mat = /^\{\?MoAsp(\w{10})MoAsp\?\}$/.exec($0)){
			return that.mvarDicts[mat[1]].replace(/\{\?MoAsp(\s*)/, "").replace(/(\s*)MoAsp\?\}/, "").replace(/(^(\s+)|(\s+)$)/, "");
		}else if(mat = /^\<\$literalid\=(\w+?)\/\$\>$/.exec($0)){
			return '_echo("' + that.mvarDicts[mat[1]].replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/\t/g,'\\t') + '");';
		}else{
			if (G.MO_PREETY_HTML || G.MO_PRETTY_HTML) { $0 = $0.replace(/>(\s+)</g, '><');}
			return $0;
		}
	});
	this.Content = this.Content.replace(/^_echo\(\"\"\);$/igm, "");
	this.Content = this.Content.replace(/(\n){2,}/g, "\n");
	this.Content = this.Content.replace(/^_echo\(\"(.+?)\"\);$/igm, "_contents += \"$1\";");
};

MoAspEnginerView.prototype.getRndid = function(l) {
	l = l || 10
	var rid = F.random.word(l);
	while (this.mvarDicts.hasOwnProperty(rid)) {
		rid = F.random.word(l);
	}
	return rid;
};

MoAspEnginerView.prototype.getRndKey = function() {
	return "k_"+this.getRndid(3);
};
//****************************************************
//@DESCRIPTION:	do something to the code that was combined to make the code pretty,such as remove blank lines
//****************************************************
MoAspEnginerView.prototype.doSomethingToAsp = function() {
	this.Content = "if(typeof Mo==\"undefined\"){Response.Write(\"invalid call.\");Response.End();}" +
		"\nfunction _echo(src){if(src===undefined || src===null) src=\"\";_contents += src;if(!__buffer && _contents.length>__buffersize) {Response.Write(_contents);_contents=\"\";}}" +
		"\nfunction _end(){if(!__buffer)Response.Write(_contents);}\nvar _contents = \"\";" +
		"\n\"UNSAFECONTENTS\";\nwith($){\n" + this.assigns + "\n" + this.Content +
		"\n}\n_end();delete _end;delete _echo;if(__buffer) return _contents;";
}

//****************************************************
//@DESCRIPTION:	parse html helper
//****************************************************
MoAspEnginerView.prototype.parseArguments = function($2) {
	$2 = replacementter($2, "\\\"", "\\\"", function(v) {
		return "\"" + v.replace(/\,/ig, "`--DOTTED--`") + "\"";
	}, null);
	var args = $2.split(","),
		argresult = "",
		_len = args.length;
	for (var i = 0; i < _len; i++) {
		if (args[i] == "{{k}}") argresult += args[i] + ",";
		else {
			args[i] = args[i].replace(/`--DOTTED--`/ig, ",");
			try {
				(new Function("return " + args[i] + ";"))();
				argresult += args[i] + ",";
			} catch (ex) {
				var code = ex.number & 0xffff;
				if (code == 5009) {
					argresult += this.parseAssign(F.string.trim(args[i])) + ",";
				} else {
					argresult += args[i] + ",";
				}
			}
		}
	}
	return F.string.trim(argresult, ",");
};
MoAspEnginerView.prototype.parseHtmlHelper = function() {
	this.Content = replacementter(this.Content, "\\{\\$Html\\.", "\\}", function($0, $1) {
		$0 = $0.replace(/\\(\{|\})/ig, "$1");
		var mc = /^(\w+)\((.*?)\)$/.exec($0);
		if (mc) {
			var parms = mc[2];
			if (parms != "") parms = this.parseArguments(parms);
			return "{?MoAsp _echo(Html." + mc[1] + "(" + parms + ")); MoAsp?}";
		} else {
			return "(此位置模板代码语法错误，相关代码：" + F.encodeHtml($1 + $0 + "}").replace(/\$/ig, "&#36;") + ")";
		}
	}, this);
};


//****************************************************
//@DESCRIPTION:	PreCombine the template with global values,such as "{$$MO_CORE}"
//****************************************************
MoAspEnginerView.prototype.parsePreCombine = function() {
	this.Content = replacementter(this.Content, "\\{\\$\\$Html\\.", "\\}", function($0, $1) {
		$0 = $0.replace(/\\(\{|\})/ig, "$1");
		var mc = /^(\w+)\((.*?)\)$/.exec($0);
		if (mc) {
			var parms = mc[2];
			if (parms != "") parms = this.parseArguments(parms);
			return (new Function("return Html." + mc[1] + "(" + parms + ");"))();
		} else {
			return "(此位置模板代码语法错误，相关代码：" + F.encodeHtml($1 + $0 + "}").replace(/\$/ig, "&#36;") + ")";
		}
	}, this);
	this.Content = replacementter(this.Content, "\\{\\$\\$U\\(", "\\}", function($0) {
		$0 = $0.replace(/\\(\{|\})/ig, "$1");
		return (new Function("return Mo.U(" + this.parseArguments($0.substr(0, $0.length - 1)) + ");"))();
	}, this);
	this.Content = replacementter(this.Content, "\\{\\$\\$", "\\}", function($0) {
		return G[$0.replace(/\\(\{|\})/ig, "$1")];
	}, this);
	this.Content = replacementter(this.Content, "\\{\\$U\\(", "\\}", function($0) {
		$0 = $0.replace(/\\(\{|\})/ig, "$1");
		return "{?MoAsp _echo(Mo.U(" + this.parseArguments($0.substr(0, $0.length - 1)) + ")); MoAsp?}";
	}, this);
}

//****************************************************
//@DESCRIPTION:	parse page tag. i will call function '$CreatePageList' to create page string,if you do not define function property
//****************************************************
MoAspEnginerView.prototype.parsePage = function() {
		F.string.matches(this.Content, /\<eof ([\s\S]+?)>([\s\S]+?)<\/eof>/igm, function($0, $1, $2) {
			var attrs = readAttrs__($1);
			if (attrs["for"]) {
				this.Content = F.replace(this.Content, $0, "{?MoAsp if(" + this.parseAssign(attrs["for"]) + ".eof()){ MoAsp?}" + $2 + "{?MoAsp } MoAsp?}");
			}
		}, this);
		F.string.matches(this.Content, /\<page ([\s\S]+?)\/>/igm, function($0, $1, $2) {
			var attrs = readAttrs__($1);
			if (attrs["for"]) {
				var loopname = attrs["for"],
					pageurl = attrs["url"] || "",
					func = attrs["function"] || "$CreatePageList";
				this.Content = F.replace(this.Content, $0, "{?MoAsp _echo(" + func + "(\"" + pageurl + "\"," + loopname + ".recordcount," + loopname + ".pagesize," + loopname + ".currentpage)); MoAsp?}");
			}
		}, this);
	}

//****************************************************
//@DESCRIPTION:	parse loop tag. 
//****************************************************
MoAspEnginerView.prototype.parseLoop = function() {
	F.string.matches(this.Content, /<loop (.+?)>/ig, function($0, $1) {
		var attrs = readAttrs__($1);
		if (attrs["name"]) {
			if (attrs["as"]) {
				var cnames = attrs["as"].split(",");
				if (cnames.length == 1) cnames = [''].concat(cnames);
				this.parseLoopByArguments($0, attrs["name"], cnames[0], cnames[1]);
			} else {
				this.parseLoopByArguments($0, attrs["name"], attrs["key"], attrs["value"] || "value", attrs["withindex"]);
			}
		}
	}, this);
	F.string.matches(this.Content, REGEXP.LOOP , function($0, $1, $2, $3, $4, $5, $6) {
		this.parseLoopByArguments($0, $1, $5, $6 || "value");
	}, this);
	this.Content = F.replace(this.Content, "</loop>", "{?MoAsp }); MoAsp?}")
}

//****************************************************
//@DESCRIPTION:	parse loop tag. 
//****************************************************
MoAspEnginerView.prototype.parseLoopByArguments = function(content, loopname, keyname, keynamevalue,withindex) {
	withindex = withindex==="true";
	var varloopname = loopname.replace(/\./ig, "_");
	var vbscript = "{?MoAsp " + loopname + ".reset();\n";
	if(keyname){
		vbscript += "var index_" + varloopname + "=" + loopname + ".pagesize *(" + loopname + ".currentpage-1);\n";
		vbscript += loopname + ".each(function(" + keynamevalue + ", index){\nvar " + keyname + "=index_" + varloopname + "+index;\n MoAsp?}"
	}else{
		vbscript += loopname + ".each(function(" + keynamevalue + "){\n MoAsp?}"
	}
	this.Content = F.replace(this.Content, content, vbscript);
}

//****************************************************
//@DESCRIPTION:	parse for tag.
//****************************************************
MoAspEnginerView.prototype.parseFor = function() {
	F.string.matches(this.Content, /<for (.+?)>/igm, function($0, $1, $2) {
		var attrs = readAttrs__($1);
		var loopname, keyname, keyvaluename, asc = true;
		if (attrs["name"]) {
			loopname = attrs["name"];
			keyname = attrs.key;
			keyvaluename = attrs.value;
			if (attrs.asc) asc = F.bool(attrs.asc);
		} else {
			var mc = REGEXP.FOR.exec($0);
			if (mc) {
				loopname = mc[1];
				keyname = mc[5];
				keyvaluename = mc[6];
			}
		}
		if (loopname) {
			keyname = keyname || this.getRndKey();
			keyvaluename = keyvaluename || "value";
			var vbscript = "";
			if (asc) {
				vbscript = "{?MoAsp (function(){\nvar " + keyvaluename + ";\nfor(var " + keyname + "=0, " + keyname + "_length=" + loopname + ".length;" + keyname + "<" + keyname + "_length;" + keyname + "++){\n" + keyvaluename + "=" + loopname + "[" + keyname + "];\nMoAsp?}\n";
			} else {
				vbscript = "{?MoAsp (function(){\nvar " + keyvaluename + ";\nfor(var " + keyname + "=" + loopname + ".length-1;" + keyname + ">=0;" + keyname + "--){\n" + keyvaluename + "=" + loopname + "[" + keyname + "];\nMoAsp?}\n";
			}
			this.Content = F.replace(this.Content, $0, vbscript);
		}
	}, this);
	this.Content = F.replace(this.Content, "</for>", "{?MoAsp }\n})();\n MoAsp?}")
}

//****************************************************
//@DESCRIPTION:	parse foreach tag.
//****************************************************
MoAspEnginerView.prototype.parseForeach = function() {
	F.string.matches(this.Content, /\<foreach ([\s\S]+?)\>/igm, function($0, $1, $2) {
		var attrs = readAttrs__($1);
		var loopname, keyname, keyvaluename;
		if (attrs["name"]) {
			loopname = attrs["name"];
			keyname = attrs.key;
			keyvaluename = attrs.value;
		} else {
			var mc = REGEXP.FOREACH.exec($0);
			if (mc) {
				loopname = mc[1];
				keyname = mc[5];
				keyvaluename = mc[6];
			}
		}
		if (loopname) {
			keyname = keyname || "key";
			keyvaluename = keyvaluename || "value";
			var vbscript = "{?MoAsp (function(){\nfor(var " + keyname + " in " + loopname + "){\nif(!" + loopname + ".hasOwnProperty(" + keyname + "))continue;\nvar " + keyvaluename + "=" + loopname + "[" + keyname + "];\nMoAsp?}\n";
			this.Content = F.replace(this.Content, $0, vbscript);
		}
	}, this);
	this.Content = F.replace(this.Content, "</foreach>", "{?MoAsp }\n})();\n MoAsp?}")
	this.parseFor();
}

//****************************************************
//@DESCRIPTION:	parse switch tag
//****************************************************
MoAspEnginerView.prototype.parseSwitch = function() {
	F.string.matches(this.Content, /<switch ([\s\S]+?)>/igm, function($0, $1) {
		var attrs = readAttrs__($1);
		if (attrs["name"]) this.Content = F.replace(this.Content, $0, "{?MoAsp switch(" + this.parseAssign(attrs["name"]) + "){ MoAsp?}");
	}, this);
	F.string.matches(this.Content, /<case ([\s\S]+?) \/>/igm, function($0, $1) {
		var vv_ = F.string.trim($1);
		if (checkassign(vv_)) vv_ = this.parseAssign(vv_);
		this.Content = F.replace(this.Content, $0, "{?MoAsp case " + vv_ + ": MoAsp?}");
	}, this);
};

//****************************************************
//@DESCRIPTION:	parse expression
//****************************************************
MoAspEnginerView.prototype.parseExpression = function() {
	F.string.matches(this.Content, /<expression ([\s\S]+?)>/igm, function($0, $1) {
		var expression = this.parseExpressionComponent($1);
		if (expression == "") {
			ExceptionManager.put(0x8300, "ViewParser", "模板代码语法错误，相关代码'" + $0 + "'");
		} else {
			this.Content = F.replace(this.Content, $0, "{?MoAsp if(" + expression + "){\n MoAsp?}");
		}
	}, this);
};
MoAspEnginerView.prototype.parseExpressionElse = function() {
	F.string.matches(this.Content, /<else ([\s\S]+?) \/>/igm, function($0, $1) {
		var expression = this.parseExpressionComponent($1)
		if (expression == "") ExceptionManager.put(0x8300, "ViewParser", "模板代码语法错误，相关代码'" + $0 + "'");
		else this.Content = F.replace(this.Content, $0, "{?MoAsp }else if(" + expression + "){ MoAsp?}");
	}, this);
};
MoAspEnginerView.prototype.parseExpressionComponent = function(compare) {
	var expression = "";
	F.string.matches(compare, /\b(and|or|group)\=(\"|\')(.+?)(\2)/igm, function($0, $1, $2, $3) {
		if ($1 == "and" || $1 == "or") {
			var v_ = $3,
				varmatches = /^(.+?)((?:\s*)(\+|\-|\*|\/|%|\<\<|\>\>|\>\>\>|\+\=|\-\=|\*\=|\/\=|\||\&|\&\&|\|\|)(?:\s*)([\d\.e\+]+))?(?:\s+)(gt|lt|ngt|nlt|eq|neq)(?:\s+)(.+?)$/i.exec(v_);
			if (varmatches) {
				var vv_ = varmatches[6];
				if (expression != "") expression += " " + ($1 == "and" ? "&&" : "||") + " ";
				if (vv_ == "Empty") {
					var vari = this.parseAssign(varmatches[1]);
					if (varmatches[2] != "") vari += varmatches[2];
					expression += " (typeof " + vari + " == \"undefined\" || is_empty(" + vari + ")) ";
				} else {
					expression += this.parseAssign(varmatches[1]);
					if (varmatches[2] != "") expression += varmatches[2];
					if (varmatches[5] == "gt") expression += " > ";
					if (varmatches[5] == "lt") expression += " < ";
					if (varmatches[5] == "ngt") expression += " <= ";
					if (varmatches[5] == "nlt") expression += " >= ";
					if (varmatches[5] == "eq") expression += " == ";
					if (varmatches[5] == "neq") expression += " != ";
					if (checkassign(vv_)) {
						vv_ = this.parseAssign(vv_);
					}
					expression += vv_;
				}
			}
		} else {
			var group = $3;
			var groupmatches = (new RegExp("<(and|or) name\\=(\\\"|\\\')" + group + "(\\2)(.+?) \\/>", "igm")).exec(this.Content);
			if (groupmatches) {
				expression += " " + (groupmatches[1] == "and" ? "&&" : "||") + " (" + this.parseExpressionComponent(groupmatches[4]) + ") "
			}
		}
	}, this);
	return expression;
}

//****************************************************
//@DESCRIPTION:	parse compare tag(gt,lt,ngt,nlt,eq,neq)
//@PARAM:	tag [String] : gt/lt/ngt/nlt/eq/neq
//****************************************************
MoAspEnginerView.prototype.parseCompare = function(tag) {
	if (tag.constructor == Array) {
		var _len = tag.length;
		for (var i = 0; i < _len; i++) {
			this.parseCompare(tag[i]);
		}
		return;
	}
	F.string.matches(this.Content, new RegExp("<" + tag + " ([\\s\\S]+?)>", "igm"), function($0, $1) {
		var attrs = readAttrs__($1);
		if (attrs["name"]) {
			var newexpression = attrs["name"] + " " + tag + " " + attrs["value"];
			this.Content = F.replace(this.Content, $0, "<expression and=\"" + newexpression + "\">");
		}
	}, this);
};

//****************************************************
//@DESCRIPTION:	parse empty tag
//****************************************************
MoAspEnginerView.prototype.parseEmpty = function() {
	F.string.matches(this.Content, /<(n)?empty ([\s\S]+?)>/igm, function($0, $1, $2) {
		var attrs = readAttrs__($2);
		if (attrs["name"]) {
			var vari = this.parseAssign(attrs["name"]);
			this.Content = F.replace(this.Content, $0, "{?MoAsp if(" + ($1 == "n" ? " !" : "") + "(typeof " + vari + " == \"undefined\" || is_empty(" + vari + "))){\n MoAsp?}")
		}
	}, this);
};

//****************************************************
//@DESCRIPTION:	parse assign tag
//****************************************************
MoAspEnginerView.prototype.parseAssignName = function() {
	F.string.matches(this.Content, /<assign ([\s\S]+?)\/>(\s*)/igm, function($0, $1) {
		var attrs = readAttrs__($1);
		if (attrs["name"]) {
			this.Content = F.replace(this.Content, $0, "");
			this.assigns += "Mo.assign(\"" + attrs["name"] + "\"," + attrs["value"] + ");\n";
		}
	}, this);
};

//****************************************************
//@DESCRIPTION:	parse source include tag(css/js/load)
//****************************************************
MoAspEnginerView.prototype.parseSource = function() {
	F.string.matches(this.Content, /<(js|css|load) ([\s\S]+?) \/>/igm, function($0, $1, $2) {
		var attrs = readAttrs__($2),
			filepath = attrs["file"] || attrs["href"] || attrs["src"] || "";
		if (filepath != "") {
			var id = "",
				cs = "",
				ext = "";
			if (filepath.indexOf(".") > 0) ext = filepath.substr(filepath.lastIndexOf("."));
			if (attrs["id"]) id = " id=\"" + attrs["id"] + "\"";
			if (attrs["charset"]) cs = " charset=\"" + attrs["charset"] + "\"";
			if ($1 == "js" || ext == ".js") {
				this.Content = F.replace(this.Content, $0, "<s" + "cript type=\"text/javascript\" src=\"" + filepath + "\"" + id + cs + "></scrip" + "t>");
			} else {
				this.Content = F.replace(this.Content, $0, "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + filepath + "\"" + id + cs + " />");
			}
		}
	}, this);
};

//****************************************************
//@DESCRIPTION:	parse single variable
//@PARAM:	chars [Variant] : #/@/[blank]
//****************************************************
MoAspEnginerView.prototype.parseVari = function(chars) {
	if (chars.constructor == Array) {
		var _len = chars.length;
		for (var i = 0; i < _len; i++) {
			this.parseVari(chars[i]);
		}
		return;
	}
	this.Content = replacementter(this.Content, "\\{\\$" + chars, "\\}", function($1, $2) {
		$2 = $2.replace(/\\/ig, "");
		var assigned = this.parseAssign($1);
		if ($2 == "{$#") {
			return "\" + " + assigned + " + \"";
		} else if ($2 == "{$@") {
			return assigned;
		} else if ($2 == "{$$") {
			return (new Function("return " + assigned))();
		} else {
			return "{?MoAsp _echo(" + assigned + ");MoAsp?}";
		}
	}, this);
};

//****************************************************
//@DESCRIPTION:	parse assign variable as asp code
//@PARAM:	key [Variant] : variable need to be parsed
//****************************************************
MoAspEnginerView.prototype.parseAssign = function(key) {
	var k = key,
		v, m_, ms_, l, c, cf, kn;
	var ms_ = /^([\w\.]+?)((?:\s*)(\+|\-|\*|\/|%|\<\<|\>\>|\>\>\>|\+\=|\-\=|\*\=|\/\=|\||\&|\&\&|\|\|)(?:\s*)([\d\.e\+]+))?(?:\s*)(\:(.+?))?(\s*?)$/i.exec(key);
	if (ms_) {
		l = ms_[1];
		c = ms_[6];
		if (c == "") {
			var rv = "";
			if (l.indexOf(".") <= 0) {
				rv = l;
			} else if (F.string.startWith(l.toLowerCase(), "c.") || F.string.startWith(l.toLowerCase(), "g.")) {
				rv = l.substr(2);
			} else if (F.string.startWith(l.toLowerCase(), "u(")) {
				rv = "Mo.U(" + l.substr(2, l.length - 3) + ")";
			} else if (F.string.startWith(l.toLowerCase(), "mo.session.")) {
				rv = "F.session(\"" + l.substr(11) + "\")";
			} else if (F.string.startWith(l.toLowerCase(), "mo.get.int.")) {
				rv = "F.get.int(\"" + l.substr(11) + "\",0)";
			} else if (F.string.startWith(l.toLowerCase(), "mo.post.int.")) {
				rv = "F.post.int(\"" + l.substr(12) + "\",0)";
			} else if (F.string.startWith(l.toLowerCase(), "mo.get.")) {
				rv = "F.get(\"" + l.substr(7) + "\")";
			} else if (F.string.startWith(l.toLowerCase(), "mo.post.")) {
				rv = "F.post(\"" + l.substr(8) + "\")";
			} else if (F.string.startWith(l.toLowerCase(), "mo.cookie.")) {
				rv = "F.cookie(\"" + l.substr(10) + "\")";
			} else if (F.string.startWith(l.toLowerCase(), "mo.server.")) {
				rv = "F.server(\"" + l.substr(10) + "\")";
			} else if (F.string.startWith(l.toLowerCase(), "mo.l.")) {
				rv = "Mo.L(\"" + l.substr(5) + "\")";
			} else if (F.string.startWith(l.toLowerCase(), "mo.lang.")) {
				rv = "Mo.L(\"" + l.substr(8) + "\")";
			} else if (F.string.startWith(l.toLowerCase(), "mo.c.")) {
				rv = "Mo.C(\"" + l.substr(5) + "\")";
			} else if (F.string.startWith(l.toLowerCase(), "mo.a.")) {
				cf = l.substr(5);
				if (cf.indexOf(".") > 0) {
					var method = cf.substr(cf.indexOf(".") + 1);
					if (Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY === false) method = method.toLowerCase();
					rv = "Mo.A(\"" + cf.substr(0, cf.indexOf(".")) + "\")." + method;
				}
			} else {
				k = l.substr(l.indexOf(".") + 1);
				l = l.substr(0, l.indexOf("."));
				rv = l + "." + k;
			}
			if (rv != "") rv += ms_[2];
			return rv;
		} else {
			var parsed = this.parseFormatVari(c);
			if (l.indexOf(".") <= 0) {
				return parsed.replace("{{k}}", l + ms_[2]);
			} else if (F.string.startWith(l.toLowerCase(), "c.") || F.string.startWith(l.toLowerCase(), "g.")) {
				return parsed.replace("{{k}}", l.substr(2));
			} else if (F.string.startWith(l.toLowerCase(), "mo.session.")) {
				return parsed.replace("{{k}}", "F.session(\"" + l.substr(11) + "\")");
			} else if (F.string.startWith(l.toLowerCase(), "mo.get.int.")) {
				return parsed.replace("{{k}}", "F.get.int(\"" + l.substr(11) + "\",0)");
			} else if (F.string.startWith(l.toLowerCase(), "mo.post.int.")) {
				return parsed.replace("{{k}}", "F.post.int(\"" + l.substr(12) + "\",0)");
			} else if (F.string.startWith(l.toLowerCase(), "mo.get.")) {
				return parsed.replace("{{k}}", "F.get(\"" + l.substr(7) + "\")");
			} else if (F.string.startWith(l.toLowerCase(), "mo.post.")) {
				return parsed.replace("{{k}}", "F.post(\"" + l.substr(8) + "\")");
			} else if (F.string.startWith(l.toLowerCase(), "mo.cookie.")) {
				return parsed.replace("{{k}}", "F.cookie(\"" + l.substr(10) + "\")");
			} else if (F.string.startWith(l.toLowerCase(), "mo.server.")) {
				return parsed.replace("{{k}}", "F.server(\"" + l.substr(10) + "\")");
			} else if (F.string.startWith(l.toLowerCase(), "mo.l.")) {
				return parsed.replace("{{k}}", "Mo.L(\"" + l.substr(5) + "\")");
			} else if (F.string.startWith(l.toLowerCase(), "mo.c.")) {
				return parsed.replace("{{k}}", "Mo.C(\"" + l.substr(5) + "\")");
			} else if (F.string.startWith(l.toLowerCase(), "mo.a.")) {
				cf = l.substr(5);
				if (cf.indexOf(".") > 0) {
					var method = cf.substr(cf.indexOf(".") + 1);
					if (Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY === false) method = method.toLowerCase();
					return parsed.replace("{{k}}", "Mo.A(\"" + cf.substr(0, cf.indexOf(".")) + "\")." + method);
				}
			} else {
				k = l.substr(l.indexOf(".") + 1);
				l = l.substr(0, l.indexOf("."));
				return parsed.replace("{{k}}", l + "." + k + ms_[2]);
			}
		}
	}
};

//****************************************************
//@DESCRIPTION:	parse special variable(function or inner object ref)
//@PARAM:	format [String] : format string
//****************************************************
MoAspEnginerView.prototype.parseFormatVari = function(format) {
	if (format == "") return "";
	var func = format,
		vars = "";
	var mc = /^(.+?)\=(.+)$/.exec(func);
	if (!mc) mc = /^(.+?)\((.+)\)$/.exec(func);
	if (mc) {
		vars = "," + mc[2];
		func = mc[1];
		var maskvars = "{{k}}" + vars;
		if (F.string.endWith(vars, ",...")) {
			vars = vars.substr(0, vars.length - 3);
			if (vars.substr(0, 1) == ",") vars = vars.substr(1);
			maskvars = vars + "{{k}}";
		} else if (vars.indexOf(",...,") >= 0) {
			vars = vars.replace(",...,", ",{{k}},");
			if (vars.substr(0, 1) == ",") vars = vars.substr(1);
			maskvars = vars;
		}
		vars = this.parseArguments(maskvars);
	} else {
		vars = "{{k}}";
	}
	var funcs = func.split(".");
	if (funcs.length == 4 && funcs[0].toLowerCase() == "mo" && funcs[1].toLowerCase() == "a") {
		if (Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY === false) funcs[3] = funcs[3].toLowerCase();
		func = "Mo.A(\"" + funcs[2] + "\")." + funcs[3];
	} else if (func.length > 2 && F.string.startWith(func.toLowerCase(), "f.")) {
		func = "F." + func.substr(2);
	}
	if (("," + G.MO_DISABLED_FUNCTIONS.toLowerCase() + ",").indexOf("," + func.toLowerCase() + ",") >= 0) {
		return "\"disabled function:" + func + "\"";
	}
	return func + "(" + vars + ")";
};
module.exports = MoAspEnginerView;