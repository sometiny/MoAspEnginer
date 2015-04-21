/*
** File: view.js
** Usage: parse template to jscript codes.
** About: 
**		support@mae.im
*/
function replacementter(src, starts, ends, callback, state){
	var regexp = new RegExp(starts + "((.*?)[^\\\\])?" + ends,"ig");
	return src.replace(regexp,function($0,$1){return callback.call(state, $1, starts, ends)});
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

var G = Mo.Config.Global;

function MoAspEnginerView(withwapper) {
	if(withwapper!==false)withwapper=true;
	this.mvarDicts = {};
	this.Content = "";
	this.loops = ";";
	this.withwapper = withwapper;
	this.assigns="";
}
MoAspEnginerView.compile = function(content){
	var _view = new MoAspEnginerView();
	_view.setContent(content).parse();
	return _view.Content;
};
MoAspEnginerView.prototype.setContent = function(content) {
	if(!content) return this;
	F.string.matches(content, /<literal>([\s\S]*)<\/literal>/ig,function($0,$1){
		var id = this.getRndid();
		this.mvarDicts[id] = $1;
		content = content.replace($0, "<literal id=\"" + id + "\"/>");
	},this);
	content = content.replace(/(\s*)\<\!\-\-\/\/(.*?)\-\-\>(\s*)/ig, "");
	content = content.replace(/(\s*)\<\!\-\-\/\*([\s\S]*?)\*\/\-\-\>(\s*)/ig, "");
	content = F.string.replace(content, /<switch(.+?)>(\s*)<case/igm, "<switch$1><case");
	content = F.string.replace(content, /\r\n/igm, "--movbcrlf--");
	content = F.string.replace(content, /\r/igm, "--movbcrlf--");
	content = F.string.replace(content, /\n/igm, "--movbcrlf--");
	content = F.string.replace(content, /(--movbcrlf--){1,}/igm, "--movbcrlf--");
	content = F.string.replace(content, /--movbcrlf--/igm, "--movbcrlf--\r\n");
	this.Content = content;
	return this;
}
MoAspEnginerView.prototype.parse = function() {
	this.parsePreCombine();
	if (G.MO_TAG_LIB != "") {
		var libs = G.MO_TAG_LIB.split(","),
			lib, closetag, tagcontent;
		for (var i = 0; i < libs.length; i++) {
			lib = libs[i];
			closetag = true;
			tagcontent = "";
			
			var taglib = Mo.LoadAssets(lib);
			if(taglib){
				var match, regexp = new RegExp("\\<" + lib + "\\b([\\s\\S]*?)\\>([\\s\\S]*?)\\<\\/" + lib + "\\>", "igm"),
					matches = F.string.matches(this.Content, regexp);
				if (matches && matches > 0) {
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
	this.getLoops(["loop", "foreach"]);
	this.parsePage();
	this.parseVari(["#", "@","$"]);
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
	F.string.matches(this.Content, /\{\?MoAsp([\s\S]*?)MoAsp\?\}/igm, function($0){
		var id = this.getRndid();
		this.mvarDicts[id] = $0;
		this.Content = F.replace(this.Content, $0, "\r\n{?MoAsp" + id + "MoAsp?}\r\n");
	},this);
	this.Content = this.Content.replace(/^--movbcrlf--$/igm, "");
	this.Content = this.Content.replace(/(\r\n){2,}/igm, "\r\n");
	if (G.MO_PREETY_HTML) {
		this.Content = this.Content.replace(/>(\s*)--movbcrlf--(\s*)\</ig, "><")
	}
	this.Content = this.Content.replace(/(^(\s+)|(\s+)$)/ig, "");
	this.Content = this.Content.replace(/\\/igm, "\\\\");
	F.string.matches(this.Content, /(\s*)<literal id\=\"(\w+?)\"\/>(\s*)/ig,function($0,$1,$2){
		this.Content = this.Content.replace($0, this.mvarDicts[$2].replace(/\\/ig, "\\\\").replace(/\r/ig, "\\r").replace(/\n/ig, "\\n"));
	},this);
	this.Content = this.Content.replace(/\"/igm, "\\\"");
	this.Content = this.Content.replace(/\t/igm, "\\t");
	this.Content = this.Content.replace(/^(.+?)$/igm, "__Mo__.Echo(\"$1\");");
	F.string.matches(this.Content, /^__Mo__\.Echo\(\"\{\?MoAsp([\w]+?)MoAsp\?\}\"\);$/igm,function($0,$1){
		this.Content = F.replace(this.Content, $0, this.mvarDicts[$1]);
	},this);
	this.Content = F.string.replace(this.Content, /\{\?MoAsp /igm, "");
	this.Content = F.string.replace(this.Content, /(\s*)MoAsp\?\}/igm, "");
};

MoAspEnginerView.prototype.getRndid = function() {
	var rid = F.random.word(10);
	while (this.mvarDicts.hasOwnProperty(rid)) {
		rid = F.random.word(10);
	}
	return rid;
};
//****************************************************
//@DESCRIPTION:	do something to the code that was combined to make the code pretty,such as remove blank lines
//****************************************************
MoAspEnginerView.prototype.doSomethingToAsp = function() {
	this.Content = this.Content.replace(/--movbcrlf--/igm, "\\r\\n");
	if(this.withwapper){
		this.Content = "if(typeof Mo==\"undefined\"){Response.Write(\"invalid call.\");Response.End();}" + 
		"\r\nfunction _echo(src){if(src===undefined || src===null) src=\"\";_contents += src;if(!__buffer && _contents.length>__buffersize) {Response.Write(_contents);_contents=\"\";}}" +
		"\r\nfunction _end(){if(!__buffer)Response.Write(_contents);}\r\n" + this.assigns + "var _contents = \"\";" +
		"\r\n\"UNSAFECONTENTS\";\r\n" + this.Content.replace(/__Mo__\.Echo\(/igm, "_echo(") + 
		"\r\n_end();delete _end;delete _echo;if(__buffer) return _contents;";
	}
	this.Content = this.Content.replace(/"\);\r\n_echo\("/igm,"");
	this.Content = this.Content.replace(/^_echo\(\"(.+?)\"\);$/igm,"_contents += \"$1\";");
	if(G.MO_PREETY_HTML){
		this.Content = this.Content.replace(/\\r\\n\\t/igm,"");
	}
}

//****************************************************
//@DESCRIPTION:	parse html helper
//****************************************************
MoAspEnginerView.prototype.parseArguments = function($2){
	$2 = replacementter($2, "\\\"", "\\\"", function(v){
		return "\"" + v.replace(/\,/ig,"`--DOTTED--`") +"\"";
	},null);
	var args = $2.split(","), argresult="", lastpart="";
	for(var i=0;i<args.length;i++){
		if(args[i] == "{{k}}") argresult += args[i] + ",";
		else{
			args[i] = args[i].replace(/`--DOTTED--`/ig,",");
			try{
				(new Function("return " + args[i] + ";"))();
				argresult += args[i] + ",";
			}catch(ex){
				var code = ex.number & 0xffff;
				if(code==5009){
					argresult += this.parseAssign(F.string.trim(args[i])) + ",";
				}else{
					argresult += args[i] + ",";
				}
			}
		}
	}
	return F.string.trim(argresult,",");
};
MoAspEnginerView.prototype.parseHtmlHelper = function() {
	this.Content = replacementter(this.Content, "\\{\\$Html\\.", "\\}", function($0,$1){
		$0 = $0.replace(/\\(\{|\})/ig,"$1");
		var mc = /^(\w+)\((.*?)\)$/.exec($0);
		if(mc){
			var parms = mc[2];
			if(parms!="") parms = this.parseArguments(parms);
			return "{?MoAsp __Mo__.Echo(Html." + mc[1] + "(" + parms + ")); MoAsp?}";
		}else{
			return "(此位置模板代码语法错误，相关代码：" + F.encodeHtml($1 + $0 +"}").replace(/\$/ig,"&#36;") + ")";
		}
	},this);
};


//****************************************************
//@DESCRIPTION:	PreCombine the template with global values,such as "{$$MO_CORE}"
//****************************************************
MoAspEnginerView.prototype.parsePreCombine = function() {
	this.Content = replacementter(this.Content, "\\{\\$\\$U\\(", "\\}", function($0){
		$0 = $0.replace(/\\(\{|\})/ig,"$1");
		return (new Function("return Mo.U(" + this.parseArguments($0.substr(0,$0.length-1)) + ");"))();
	},this);
	this.Content = replacementter(this.Content, "\\{\\$\\$", "\\}", function($0){
		return G[$0.replace(/\\(\{|\})/ig,"$1")];
	},this);
	this.Content = replacementter(this.Content, "\\{\\$U\\(", "\\}", function($0){
		$0 = $0.replace(/\\(\{|\})/ig,"$1");
		return "{?MoAsp __Mo__.Echo(Mo.U(" + this.parseArguments($0.substr(0,$0.length-1)) + ")); MoAsp?}";
	},this);
}

//****************************************************
//@DESCRIPTION:	parse page tag. i will call function 'CreatePageList' to create page string,if you do not define function property
//****************************************************
MoAspEnginerView.prototype.parsePage = function() {
	F.string.matches(this.Content, /\<eof ([\s\S]+?)>([\s\S]+?)<\/eof>/igm,function($0,$1,$2){
		var attrs = readAttrs__($1);
		if (attrs["for"]) {
			if (this.loops.indexOf(";" + attrs["for"].replace(/\./ig,"_") + ";") >= 0) {
				this.Content = F.replace(this.Content, $0, "{?MoAsp if(" + this.parseAssign(attrs["for"]) + ".eof()){ MoAsp?}" + $2 + "{?MoAsp } MoAsp?}");
			}else{
				this.Content = F.replace(this.Content, $0, "");
			}
		}
	},this);
	F.string.matches(this.Content, /\<page ([\s\S]+?)>([\s\S]*?)\<\/page>/igm,function($0,$1,$2){
		var attrs = readAttrs__($1);
		if (attrs["for"]) {
			this.mvarDicts["EOF_OF_" + attrs["for"]] = $2;
			this.Content = F.replace(this.Content, $0, "<page " + $1 + "/>")
		}
	},this);
	F.string.matches(this.Content, /\<page ([\s\S]+?)\/>/igm,function($0,$1,$2){
		var attrs = readAttrs__($1);
		if (attrs["for"]) {
			var loopname = attrs["for"],
				varloopname = loopname.replace(/\./ig,"_"),
				nloopname = loopname,
				pageurl = attrs["url"] || "",
				func = attrs["function"] || "CreatePageList";
			if (this.loops.indexOf(";" + varloopname + ";") >= 0) {
				nloopname = "D__" + varloopname;
				this.Content = F.replace(this.Content, $0, "{?MoAsp " + nloopname + " = " + this.parseAssign(loopname) + "; MoAsp?}\r\n{?MoAsp __Mo__.Echo(" + func + "(\"" + pageurl + "\"," + nloopname + ".recordcount," + nloopname + ".pagesize," + nloopname + ".currentpage)); MoAsp?}");
			} else {
				this.Content = F.replace(this.Content, $0, "");
			}
		}
	},this);
}
//****************************************************
//@DESCRIPTION:	get all loop tags.
//****************************************************
MoAspEnginerView.prototype.getLoops = function(name) {
	if (name.constructor == Array) {
		for (var i = 0; i < name.length; i++) {
			this.getLoops(name[i]);
		}
		return;
	}
	F.string.matches(this.Content, new RegExp("\\<" + name + " ([\\s\\S]+?)\\>", "igm"),function($0,$1){
		var attrs = readAttrs__($1);
		if (attrs["name"]) this.loops += attrs["name"].replace(/\./ig,"_") + ";"
	},this);
}

//****************************************************
//@DESCRIPTION:	parse loop tag. All looped data is an instance of list(DataTable) which is defined in 'Mo.Extend.asp'
//****************************************************
MoAspEnginerView.prototype.parseLoop = function() {
	F.string.matches(this.Content, /\<loop ([\s\S]+?)\>([\s\S]+?)<\/loop>/igm,function($0,$1,$2){
		var attrs = readAttrs__($1);
		if (attrs["name"]) {
			var loopname = attrs["name"],
				varloopname = loopname.replace(/\./ig,"_"),
				varname = loopname, 
				keyname = attrs["as"] || "value";
			varname = "D__" + varloopname;
			var vbscript = "{?MoAsp var " + varname + " = " + this.parseAssign(loopname) + ";\r\n";
			vbscript += varname + ".reset();\r\n";
			var contenteof = attrs["eof"] || "";
			if (contenteof != "") contenteof = F.replace(F.replace(contenteof, "&gt;", ">"), "&lt;", "<");
			if (this.mvarDicts.hasOwnProperty("EOF_OF_" + loopname)) contenteof = this.mvarDicts["EOF_OF_" + loopname];
			contenteof = F.replace(F.replace(contenteof, "\"", "\\\""), "\r\n", "");
			if (contenteof != "") vbscript += "if(" + varname + ".eof()){\r\n__Mo__.Echo(\"" + contenteof + "\");\r\n}\r\n";
			vbscript += "var index_" + varloopname + "=" + varname + ".pagesize *(" + varname + ".currentpage-1);\r\n";
			vbscript += varname + ".each(function(" + keyname + ", index){\r\nvar key=index_" + varloopname + "+index;\r\n MoAsp?}"
			var content = new MoAspEnginerView(false).setContent($2.replace(/--movbcrlf--/igm,"\r\n")).parse().Content.replace(new RegExp("\\$\\[\"(key|" + keyname + ")\"\\]","igm"),"$1").replace(/\\r\\n$/igm,"");
			this.Content = F.replace(this.Content, $0, vbscript + "{?MoAsp " + content + " MoAsp?}\r\n{?MoAsp });\r\n" + " MoAsp?}");
		}
	},this);
	this.Content = F.replace(this.Content, "</loop>", "{?MoAsp });" + " MoAsp?}")
}

//****************************************************
//@DESCRIPTION:	parse for tag.
//****************************************************
MoAspEnginerView.prototype.parseFor = function() {
	F.string.matches(this.Content, /\<for ([\s\S]+?)\>([\s\S]+?)<\/for>/igm ,function($0,$1,$2){
		var attrs = readAttrs__($1);
		if (attrs["name"]) {
			var loopname = attrs["name"],
				varloopname = loopname.replace(/\./ig,"_")
				keyname = attrs.key||"key",
				keyvaluename = attrs.value||"value";
			var content = new MoAspEnginerView(false).setContent($2.replace(/--movbcrlf--/igm,"\r\n")).parse().Content.replace(new RegExp("\\$\\[\"(" + keyname + "|" + keyvaluename + ")\"\\]","igm"),"$1").replace(/\\r\\n$/igm,"");
			vbscript = "{?MoAsp var D__" + varloopname + "=" + this.parseAssign(loopname) + ";\r\nfor(var " + keyname + "=0;" + keyname + "<D__" + varloopname + ".length;" + keyname + "++){\r\nvar " + keyvaluename + "=D__" + varloopname + "[" + keyname + "];\r\nMoAsp?}\r\n{?MoAsp " + content + " MoAsp?}\r\n{?MoAsp }\r\n MoAsp?}";
			this.Content = F.replace(this.Content, $0, vbscript);
		}
	},this);
}

//****************************************************
//@DESCRIPTION:	parse foreach2 tag.
//****************************************************
MoAspEnginerView.prototype.parseForeach2 = function() {
	F.string.matches(this.Content, /\<foreach2 ([\s\S]+?)\>([\s\S]+?)<\/foreach2>/igm ,function($0,$1,$2){
		var attrs = readAttrs__($1);
		if (attrs["name"]) {
			var loopname = attrs["name"],
				keyname = attrs.key||"key",
				keyvaluename = attrs.value||"value";
			var content = new MoAspEnginerView(false).setContent($2.replace(/--movbcrlf--/igm,"\r\n")).parse().Content.replace(new RegExp("\\$\\[\"(" + keyname + "|" + keyvaluename + ")\"\\]","igm"),"$1").replace(/\\r\\n$/igm,"");
			this.Content = F.replace(this.Content, $0, "{?MoAsp F.foreach(" + this.parseAssign(loopname) + ",function(" + keyname + "," + keyvaluename + "){\r\n MoAsp?}\r\n{?MoAsp " + content + " MoAsp?}\r\n{?MoAsp });\r\n MoAsp?}");
		}
	},this);
}

//****************************************************
//@DESCRIPTION:	parse foreach tag.
//****************************************************
MoAspEnginerView.prototype.parseForeach = function() {
	F.string.matches(this.Content, /\<foreach ([\s\S]+?)\>([\s\S]+?)<\/foreach>/igm ,function($0,$1,$2){
		var attrs = readAttrs__($1);
		if (attrs["name"]) {
			var loopname = attrs["name"],
				varloopname = loopname.replace(/\./ig,"_")
				keyname = attrs.key||"key",
				keyvaluename = attrs.value||"value";
			var content = new MoAspEnginerView(false).setContent($2.replace(/--movbcrlf--/igm,"\r\n")).parse().Content.replace(new RegExp("\\$\\[\"(" + keyname + "|" + keyvaluename + ")\"\\]","igm"),"$1").replace(/\\r\\n$/igm,"");
			vbscript = "{?MoAsp var D__" + varloopname + "=" + this.parseAssign(loopname) + ";\r\nfor(var " + keyname + " in D__" + varloopname + "){\r\nif(!D__" + varloopname + ".hasOwnProperty(" + keyname + "))continue;\r\nvar " + keyvaluename + "=D__" + varloopname + "[" + keyname + "];\r\nMoAsp?}\r\n{?MoAsp " + content + " MoAsp?}\r\n{?MoAsp }\r\n MoAsp?}";
			this.Content = F.replace(this.Content, $0, vbscript);
		}
	},this);
	this.parseForeach2();
	this.parseFor();
}

//****************************************************
//@DESCRIPTION:	parse switch tag
//****************************************************
MoAspEnginerView.prototype.parseSwitch = function() {
	F.string.matches(this.Content, /<switch ([\s\S]+?)>/igm ,function($0,$1){
		var attrs = readAttrs__($1);
		if (attrs["name"]) this.Content = F.replace(this.Content, $0, "{?MoAsp switch(" + this.parseAssign(attrs["name"]) + "){ MoAsp?}");
	},this);
	this.parseCase();
};

//****************************************************
//@DESCRIPTION:	parse case tag
//****************************************************
MoAspEnginerView.prototype.parseCase = function() {
	F.string.matches(this.Content, /<case ([\s\S]+?)\/>/igm ,function($0,$1){
		var attrs = readAttrs__($1),
			quto = "\"";
		if ("|bool|number|money|date|assign|".indexOf("|" + (attrs["type"] || "") + "|") > 0) quto = "";
		this.Content = F.replace(this.Content, $0, "{?MoAsp case " + quto + attrs["value"] + quto + ": MoAsp?}");
	},this);
};

//****************************************************
//@DESCRIPTION:	parse expression
//****************************************************
MoAspEnginerView.prototype.parseExpression = function() {
	F.string.matches(this.Content, /<expression ([\s\S]+?)>/igm ,function($0,$1){
		var expression = this.parseExpressionComponent($1);
		if (expression == "") {
			ExceptionManager.put(0x8300,"ViewParser","模板代码语法错误，相关代码'" + $0 + "'");
		}else{
			this.Content = F.replace(this.Content, $0, "{?MoAsp if(" + expression + "){\r\n MoAsp?}");
		}
	},this);
};
MoAspEnginerView.prototype.parseExpressionElse = function() {
	F.string.matches(this.Content, /<else ([\s\S]+?) \/>/igm ,function($0,$1){
		var expression = this.parseExpressionComponent($1)
		if (expression == "") ExceptionManager.put(0x8300,"ViewParser","模板代码语法错误，相关代码'" + $0 + "'");
		else this.Content = F.replace(this.Content, $0, "{?MoAsp }else if(" + expression + "){ MoAsp?}");
	},this);
};
MoAspEnginerView.prototype.parseExpressionComponent = function(compare) {
	var expression="";
	F.string.matches(compare, /\b(and|or|group)\=(\"|\')(.+?)(\2)/igm ,function($0,$1,$2,$3){
		if ($1 == "and" || $1 == "or") {
			var v_ = $3,
				varmatches = /^(.+?)((\s)(\+|\-|\*|\/|%|\<\<|\>\>|\>\>\>|\+\=|\-\=|\*\=|\/\=|\||\&|\&\&|\|\|)(\s)([\d\.e\+]+))?(\s)(gt|lt|ngt|nlt|eq|neq)(\s)(.+?)((\s)as(\s)(bool|number|money|date|assign))?$/i.exec(v_);
			if (varmatches) {
				var quto = "\"",
					vv_ = varmatches[10];
				if (expression != "") expression += " " + ($1 == "and" ? "&&" : "||") + " ";
				if (F.string.endWith(varmatches[8], "t")) quto = "";
				if (vv_ == "Empty") {
					var vari = this.parseAssign(varmatches[1]);
					if (varmatches[2] != "") vari += varmatches[2];
					expression += " (typeof " + vari + " == \"undefined\" || is_empty(" + vari + ")) ";
				} else {
					expression += this.parseAssign(varmatches[1]);
					if (varmatches[2] != "") expression += varmatches[2];
					if (varmatches[8] == "gt") expression += " > ";
					if (varmatches[8] == "lt") expression += " < ";
					if (varmatches[8] == "ngt") expression += " <= ";
					if (varmatches[8] == "nlt") expression += " >= ";
					if (varmatches[8] == "eq") expression += " == ";
					if (varmatches[8] == "neq") expression += " != ";
					if (varmatches[11] != "") {
						quto = "";
						if (varmatches[14] == "assign") vv_ = this.parseAssign(vv_);
					}
					if (F.string.test(vv_, /^\{\$(.+?)\}$/i)) {
						vv_ = this.parseAssign(F.string.replace(vv_, /^\{\$(.+?)\}$/i, "$1"));
						quto = "";
					}
					expression += quto + vv_ + quto;
				}
			}
		} else {
			var group = $3;
			var groupmatches = (new RegExp("<(and|or) name\\=(\\\"|\\\')" + group + "(\\2)(.+?) \\/>", "igm")).exec(this.Content);
			if (groupmatches) {
				expression += " " + (groupmatches[1] == "and" ? "&&" : "||") + " (" + this.parseExpressionComponent(groupmatches[4]) + ") "
			}
		}
	},this);
	return expression;
}

//****************************************************
//@DESCRIPTION:	parse compare tag(gt,lt,ngt,nlt,eq,neq)
//@PARAM:	tag [String] : gt/lt/ngt/nlt/eq/neq
//****************************************************
MoAspEnginerView.prototype.parseCompare = function(tag) {
	if (tag.constructor == Array) {
		for (var i = 0; i < tag.length; i++) {
			this.parseCompare(tag[i]);
		}
		return;
	}
	F.string.matches(this.Content, new RegExp("<" + tag + " ([\\s\\S]+?)>", "igm") ,function($0,$1){
		var attrs = readAttrs__($1);
		if (attrs["name"]) {
			var newexpression = attrs["name"] + " " + tag + " " + attrs["value"];
			if (attrs["type"]) newexpression += " as " + attrs["type"];
			this.Content = F.replace(this.Content, $0, "<expression and=\"" + newexpression + "\">");
		}
	},this);
};

//****************************************************
//@DESCRIPTION:	parse empty tag
//****************************************************
MoAspEnginerView.prototype.parseEmpty = function() {
	F.string.matches(this.Content, /<(n)?empty ([\s\S]+?)>/igm ,function($0,$1,$2){
		var attrs = readAttrs__($2);
		if (attrs["name"]) {
			var vari = this.parseAssign(attrs["name"]);
			this.Content = F.replace(this.Content, $0, "{?MoAsp if(" + ($1 == "n" ? " !" : "") + "(typeof " + vari + " == \"undefined\" || is_empty(" + vari + "))){\r\n MoAsp?}")
		}
	},this);
};

//****************************************************
//@DESCRIPTION:	parse assign tag
//****************************************************
MoAspEnginerView.prototype.parseAssignName = function() {
	F.string.matches(this.Content, /<assign ([\s\S]+?)\/>(\s*)/igm ,function($0,$1){
		var attrs = readAttrs__($1);
		if (attrs["name"]){
			var quto="\"";
			if(attrs["notstring"]=="true") quto = "";
			this.Content = F.replace(this.Content, $0, "");
			this.assigns += "Mo.assign(\"" + attrs["name"] + "\"," + quto + F.string.replace(attrs["value"], /\"/igm, "\\\"") + quto + ");\r\n";
		}
	},this);
};

//****************************************************
//@DESCRIPTION:	parse source include tag(css/js/load)
//****************************************************
MoAspEnginerView.prototype.parseSource = function() {
	F.string.matches(this.Content, /<(js|css|load) ([\s\S]+?) \/>/igm ,function($0,$1,$2){
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
	},this);
};

//****************************************************
//@DESCRIPTION:	parse single variable
//@PARAM:	chars [Variant] : #/@/[blank]
//****************************************************
MoAspEnginerView.prototype.parseVari = function(chars) {
	if (chars.constructor == Array) {
		for (var i = 0; i < chars.length; i++) {
			this.parseVari(chars[i]);
		}
		return;
	}
	this.Content = replacementter(this.Content, "\\{\\$" + chars, "\\}", function($1, $2){
		$1 = $1.replace(/\\(\{|\})/ig,"$1");
		var assigned = this.parseAssign($1);
		if ($2 == "{$#") {
			return "\" + " + assigned + " + \"";
		} else if ($2 == "{$@") {
			return assigned;
		} else if ($2 == "{$$") {
			return (new Function("return " + assigned))();
		} else {
			return "{?MoAsp __Mo__.Echo(" + assigned + ");MoAsp?}";
		}
	},this);
};

//****************************************************
//@DESCRIPTION:	parse assign variable as asp code
//@PARAM:	key [Variant] : variable need to be parsed
//****************************************************
MoAspEnginerView.prototype.parseAssign = function(key) {
	var k = key,
		v, m_, ms_, l, c, cf, kn;
	var ms_ = /^([\w\.]+?)((\s)(\+|\-|\*|\/|%|\<\<|\>\>|\>\>\>|\+\=|\-\=|\*\=|\/\=|\||\&|\&\&|\|\|)(\s)([\d\.e\+]+))?(\:(.+?))?$/i.exec(key);
	if (ms_) {
		l = ms_[1];
		c = ms_[8];
		if (c == "") {
			var rv = "";
			if (l.indexOf(".") <= 0) {
				rv = "$[\"" + l + "\"]";
			} else if (F.string.startWith(l.toLowerCase(), "c.") || F.string.startWith(l.toLowerCase(), "g.")) {
				rv = l.substr(2);
			} else if (F.string.startWith(l.toLowerCase(), "u(")) {
				rv = "Mo.U(" + l.substr(2,l.length-3) + ")";
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
			} else if (F.string.startWith(l.toLowerCase(), "mo.c.") || F.string.startWith(l.toLowerCase(), "mo.config.")) {
				cf = l.substr(5);
				if (F.string.startWith(l.toLowerCase(), "mo.config.")) cf = l.substr(10);
				if (cf.indexOf(".") > 0) {
					rv = "Mo.C(\"" + cf.substr(0, cf.indexOf(".")) + "." + cf.substr(cf.indexOf(".") + 1) + "\")";
				} else {
					rv = "Mo.C(\"Global." + cf.substr(cf.indexOf(".") + 1) + "\")";
				}
			} else if (F.string.startWith(l.toLowerCase(), "mo.a.")) {
				cf = l.substr(5);
				if (cf.indexOf(".") > 0) {
					var method = cf.substr(cf.indexOf(".") + 1);
					if(Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY===false) method = method.toLowerCase();
					rv = "Mo.A(\"" + cf.substr(0, cf.indexOf(".")) + "\")." + method;
				}
			} else {
				k = l.substr(l.indexOf(".") + 1);
				l = l.substr(0, l.indexOf("."));
				rv = "$[\"" + l + "\"]." + k;
			}
			if (rv != "") rv += ms_[2];
			return rv;
		} else {
			var parsed = this.parseFormatVari(c);
			if (l.indexOf(".") <= 0) {
				return parsed.replace("{{k}}", "$[\"" + l + "\"]" + ms_[2]);
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
				cf = l.substr(5);
				if (cf.indexOf(".") > 0) {
					return parsed.replace("{{k}}", "Mo.C(\"" + cf.substr(0, cf.indexOf(".")) + "\")." + cf.substr(cf.indexOf(".") + 1));
				} else {
					return parsed.replace("{{k}}", "Mo.C(\"Global." + cf.substr(cf.indexOf(".") + 1));
				}
			} else if (F.string.startWith(l.toLowerCase(), "mo.a.")) {
				cf = l.substr(5);
				if (cf.indexOf(".") > 0) {
					var method = cf.substr(cf.indexOf(".") + 1);
					if(Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY===false) method = method.toLowerCase();
					return parsed.replace("{{k}}", "Mo.A(\"" + cf.substr(0, cf.indexOf(".")) + "\")." + method);
				}
			} else {
				k = l.substr(l.indexOf(".") + 1);
				l = l.substr(0, l.indexOf("."));
				return parsed.replace("{{k}}", "$[\"" + l + "\"]." + k + ms_[2]);
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
		vars = "",
		ret = "";
	var mc = /^(.+?)\=(.+)$/.exec(func);
	if(!mc) mc = /^(.+?)\((.+)\)$/.exec(func);
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
	}else{
		vars = "{{k}}";
	}
	var funcs = func.split(".");
	if (funcs.length == 4 && funcs[0].toLowerCase() == "mo" && funcs[1].toLowerCase() == "a") {
		if(Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY===false) funcs[3] = funcs[3].toLowerCase();
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