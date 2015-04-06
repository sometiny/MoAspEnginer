<script language="jscript" runat="server">
/*
** File: Function.asp
** Usage: common functions for global. 
**		if you add some functions, you should add the names to exports.
**		or you can not use then in your business.
** About: 
**		support@mae.im
*/
IsEmpty = is_empty = function(variable){
	return variable===""||variable===null||variable===undefined;
}

CreatePageList = function(URL, RecordCount, PageSize, CurrentPage){
	var PageCount ,PageStr="";
	if(URL==""){
		F.object.toURIString.clearFilter();
		F.object.toURIString.filter.push("!page");
		URL=("?" + F.get.toURIString() + "&page={#page}").replace("?&","?");
		F.object.toURIString.clearFilter();
	}
	CurrentPage = parseInt(CurrentPage);
	RecordCount = parseInt(RecordCount);
	PageSize = parseInt(PageSize);
	var rp=RecordCount % PageSize;
	PageCount = (RecordCount-rp) / PageSize + (rp==0?0:1);
	PageStr = "共[" + RecordCount + "]条记录 [" + PageSize + "]条/页 当前[" + CurrentPage + "/" + PageCount + "]页&nbsp; ";
	if(CurrentPage == 1 || PageCount == 0){
		PageStr += "<a>首页</a>&nbsp;"
		PageStr += "<a>上页</a>&nbsp;"
	}else{
		PageStr += "<a href=\"" + URL.replace("{#page}", 1) + "\">首页</a>&nbsp;";
		PageStr += "<a href=\"" + URL.replace("{#page}", CurrentPage-1) + "\">上页</a>&nbsp;";
	}
	if(CurrentPage == PageCount || PageCount == 0){
		PageStr += "<a>下页</a>&nbsp;"
		PageStr += "<a>尾页</a>&nbsp;"
	}else{
		PageStr += "<a href=\"" + URL.replace("{#page}", CurrentPage + 1) + "\">下页</a>&nbsp;";
		PageStr += "<a href=\"" + URL.replace("{#page}", PageCount) + "\">尾页</a>&nbsp;";
	}
	return PageStr;
}

ReCompileForDebug = function(content, add, add2){
	add = add || 0;
	add2 = add2 || 2;
	var newline= content.indexOf("\r\n")>=0 ? "\r\n" : (content.indexOf("\r")>=0 ? "\r":"\n");
	
	var lines = content.split(newline), _content = "", compileLineNumber=0, lastendingisd=false;
	for(var i=0;i<lines.length;i++){
		var line = F.string.trim(lines[i]);
		
		if(
			F.string.trim(line)=="" || 
			F.string.endsWith(line,"*\/") || 
			/^(\/\/|\/\*|\*\*|\)|\])/i.test(line) ||
			/^(\w+)(\s*)\:/i.test(line) || 
			/^"(.*?)"(\s*)\:/i.test(line) || 
			/^'(.*?)'(\s*)\:/i.test(line) || 
			/^([^\w]+)$/i.test(line.replace(/\b(if|else|function|switch|case|default|break|var|for|in|return|try|catch|finally|true|false|new|null|typeof)\b/ig,"")) || 
			/^(catch|case|else|_contents \+\= ")/i.test(line) || 
			/^(\w+)Controller\.extend\(/i.test(line) || lastendingisd){
			_content += lines[i] + "\r\n";
			compileLineNumber++;
		}else{
			compileLineNumber+=2;
			_content += lines[i].replace(/^(\s*)(.+?)$/ig,"$1") + "Mo.Debug(" + (i+add2) + ",__filename, " + (compileLineNumber+add) + ",__scripts);\r\n " + lines[i] + "\r\n";
		}
		lastendingisd = /(,|\(|\[)$/i.test(line) || /^(\w+)(\s*)\:/i.test(line) || /^"(.*?)"(\s*)\:/i.test(line) || /^'(.*?)'(\s*)\:/i.test(line);
	}
	return F.string.trim(_content,"\r\n");
};
jsEncode = function(str) {
	if (str == undefined) return "";
	if (str == "") return "";
	var i, j, aL1, aL2, c, p, ret = "";
	aL1 = Array(0x22, 0x5C, 0x2F, 0x08, 0x0C, 0x0A, 0x0D, 0x09);
	aL2 = Array(0x22, 0x5C, 0x2F, 0x62, 0x66, 0x6E, 0x72, 0x74);
	for (i = 0; i < str.length; i++) {
		p = true;
		c = str.substr(i, 1);
		for (j = 0; j <= 7; j++) {
			if (c == String.fromCharCode(aL1[j])) {
				ret += "\\" + String.fromCharCode(aL2[j]);
				p = false;
				break;
			}
		}
		if (p) {
			var a = c.charCodeAt(0);
			if (a > 31 && a < 127) {
				ret += c;
			} else if (a > -1 || a < 65535) {
				var slashu = a.toString(16);
				while (slashu.length < 4) {
					slashu = "0" + slashu;
				}
				ret += "\\u" + slashu;
			}
		}
	}
	return ret;
};
</script>