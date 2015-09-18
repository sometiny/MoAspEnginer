<script language="jscript" runat="server">
/*
** File: Function.asp
** Usage: common functions for global. 
**		if you add some functions, you should add the names to exports.
**		or you can not use then in your business.
** About: 
**		support@mae.im
*/
$IsEmpty = is_empty = function(variable){
	return variable===""||variable===null||variable===undefined;
}

$CreatePageList = function(URL, RecordCount, PageSize, CurrentPage){
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
STRstr = function(str) {
	if (is_empty(str)) return "";
	var i, c, es=[], ret = "", len = str.length, buffer=[];
	es[8]='b';es[9]='t';es[10]='n';es[12]='f';es[13]='r';es[34]='"';es[47]='\/';es[92]='\\';
	for (i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if(es[c]!==undefined){
			buffer.push(92, c);
			continue;
		}
		if (c > 31 && c < 127) {
			buffer.push(c);
			continue;
		}
		if(buffer.length>0){
			ret += String.fromCharCode.apply(null, buffer);
			buffer.length = 0;
		}
		ret += "\\u" + ("0000" + c.toString(16)).slice(-4);
	}
	if(buffer.length>0){
		ret += String.fromCharCode.apply(null, buffer);
		buffer.length = 0;
	}
	return ret;
};
</script>