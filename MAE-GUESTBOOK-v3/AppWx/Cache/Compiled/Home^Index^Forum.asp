<script language="jscript" runat="server">
if(typeof Mo=="undefined"){Response.Write("invalid call.");Response.End();}
function _echo(src){if(src===undefined || src===null) src="";_contents += src;if(!__buffer && _contents.length>__buffersize) {Response.Write(_contents);_contents="";}}
function _end(){if(!__buffer)Response.Write(_contents);}
var _contents = "";
"UNSAFECONTENTS";
_contents += "<!DOCTYPE html>\r\n<html lang=\"zh-cn\" dir=\"ltr\">\r\n<head>\r\n<meta charset=\"UTF-8\" />\r\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\r\n<!--<meta name=\"viewport\" content=\"width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no\" />-->\r\n<title>";
_echo($["System"].SubTitle);
_contents += "-";
_echo($["System"].Title);
_contents += "</title>\r\n<link rel=\"stylesheet\" type=\"text/css\" href=\"Contents/Css/reset.css\" />\r\n<link rel=\"stylesheet\" type=\"text/css\" href=\"Contents/Css/style.css\" />\r\n<script type=\"text/javascript\" src=\"Contents/Scripts/f.js\"></script>\r\n<script type=\"text/javascript\" src=\"Contents/Scripts/f.e.js\"></script>\r\n<script type=\"text/javascript\" src=\"Contents/Scripts/f.ajax.js\"></script>\r\n<script type=\"text/javascript\" src=\"Contents/Scripts/common.js\"></script>\r\n</head>\r\n<body>\r\n<div id=\"wapper\">\r\n\t<div id=\"wapper-header-top\">";
_echo($["System"].Notice);
_contents += "</div>\r\n\t<div id=\"wapper-header\">\r\n\t\t<h3>";
_echo($["System"].Title);
_contents += "</h3>\r\n\t\t<h4>";
_echo($["System"].SubTitle);
_contents += "</h4>\r\n\t</div>\r\n\t<div id=\"wapper-body\" class=\"clearfix\">\r\n\t\t<div class=\"list-box\">\r\n\t\t\t<ul>\r\n\t\t\t\t<li";
if(F.get.int("Id",0) <= 0){
_contents += " class=\"hover\"";
}
_contents += "><a href=\"/\">首页</a></li>\r\n\t\t\t\t";
var D__Forum = $["Forum"];
D__Forum.reset();
var index_Forum=D__Forum.pagesize *(D__Forum.currentpage-1);
D__Forum.each(function(Forum, index){
var key=index_Forum+index;
_contents += "<li rel=\"";
_echo(Forum.Tag);
_contents += ":";
_echo(Forum.Title);
_contents += "\"";
if(Forum.Tag == F.get.int("Id",0)){
_contents += " class=\"hover\"";
}
_contents += "><a href=\"?Id=";
_echo(Forum.Tag);
_contents += "\">";
_echo(Forum.Title);
_contents += "</a></li>\r\n";
});
_contents += "\t\t\t</ul>\r\n\t\t</div>\r\n<div class=\"content-box-list\">\r\n<div class=\"box-forum\"><h4>当前版块：";
_echo(F.encodeHtml($["ForumInfo"].Title));
_contents += "</h4><h5>";
_echo(F.encodeHtml($["ForumInfo"].Description));
_contents += "</h5></div>\r\n";
var D__Thread = $["Thread"];
D__Thread.reset();
var index_Thread=D__Thread.pagesize *(D__Thread.currentpage-1);
D__Thread.each(function(Thread, index){
var key=index_Thread+index;
_contents += "<div class=\"content-box\">\r\n\t<div class=\"box-header\">\r\n\t\t<h5>Post By '";
_echo(Thread.PostFrom);
_contents += "', At '";
_echo(Thread.PostIp);
_contents += "', On '";
_echo(F.untimespan(Thread.PostDate));
_contents += "' About '<a href=\"?Id=";
_echo(Thread.ForumTag);
_contents += "\">";
_echo(Thread.ForumName);
_contents += "</a>'</h5>\r\n\t\t<h4><a href=\"?a=thread&Id=";
_echo(Thread.Id);
_contents += "\">";
_echo(Thread.Title);
_contents += "</a></h4>\r\n\t</div>\r\n\t<div class=\"content\">";
_echo(Thread.Description);
_contents += "</div>\r\n\t";
if(Thread.IsReplied == 1){
_contents += "<div class=\"reply\"><quot>";
_echo(Mo.A("Home").GetReply(Thread.Id));
_contents += "</quot></div>";
}
_contents += "</div>\r\n";
});
if( !(typeof F.get.int("Id",0) == "undefined" || is_empty(F.get.int("Id",0)))){
_contents += "<div id=\"wapper-page\">";
D__Thread = $["Thread"];
_echo($CreatePageList("",D__Thread.recordcount,D__Thread.pagesize,D__Thread.currentpage));
_contents += "</div>";
}
_contents += "</div>\r\n<script type=\"text/javascript\">\r\nvar html = '';\r\nhtml += '<form action=\"?a=postmessage\" method=\"post\" onsubmit=\"return false;\" name=\"postmessageform\">';\r\nhtml += '<label>版块：</label>';\r\nhtml += '<select name=\"ForumTag\">';\r\nF(\"li[rel]\").each(function(){\r\n\tvar rel = F(this).attr(\"rel\").split(\":\");\r\n\thtml += '<option value=\"'+ rel[0] +'\">'+ rel[1] +'</option>';\r\n});\r\nhtml += '</select>';\r\nhtml += '<label>名字：</label><input type=\"text\" name=\"PostFrom\" class=\"width_200\" value=\"#匿名#\" /> 您的名字。';\r\nhtml += '<label>邮箱：</label><input type=\"text\" name=\"PostEmail\" class=\"width_200\" /> *您的邮箱。';\r\nhtml += '<label>主页：</label><input type=\"text\" name=\"PostHomepage\" class=\"width_200\" /> 您的主页。';\r\nhtml += '<label>标题：</label><input type=\"text\" name=\"Title\" class=\"width_200\" /> *留言标题，不超过50字。';\r\nhtml += '<label>内容：</label><textarea cols=\"60\" rows=\"4\" name=\"Description\"></textarea> *留言内容，不超过1000字';\r\nhtml += '<label>验证码：</label><input type=\"text\" name=\"SafeCode\" /> <img src=\"?a=code\" onclick=\"this.src=\\'?a=code&_t=\\'+Math.random();\" style=\"cursor:pointer\" />';\r\nhtml += '</form>';\r\nfunction PostMessage(){\r\n\tF(\"#DialogAlert\").attr(\"title\",\"发表留言\").html(html).dialog({\r\n\t\t\"width\":575,\"height\":600,\"maxHeight\":600,buttons:{\r\n\t\t\t\"立即发表\":function(){\r\n\t\t\t\tAjax({\r\n\t\t\t\t\tform:document.forms[\"postmessageform\"],\r\n\t\t\t\t\tsucceed:function(msg){\r\n\t\t\t\t\t\tShowTips(\"提示\",msg.replace(/\\n/igm,\"<br />\"));\r\n\t\t\t\t\t\tif(msg==\"留言发表成功。\")window.setTimeout(function(){window.location.reload();}, 1000);\r\n\t\t\t\t\t}\r\n\t\t\t\t});\r\n\t\t\t\treturn false;\r\n\t\t\t}\r\n\t\t}\r\n\t});\r\n}\r\n</script>\r\n<div id=\"DialogAlert\"></div>\r\n\t</div>\r\n\t<div id=\"wapper-foot\">";
_echo($["System"].CopyRight);
_contents += "&nbsp;<a href=\"http://m.thinkasp.cn/\" target=\"_blank\">MAE官网</a></div>\r\n</div>\r\n<div class=\"round round-1\"></div>\r\n<div class=\"round round-2\"></div>\r\n<div class=\"round round-3\"></div>\r\n<div class=\"round round-4\"></div>\r\n<div class=\"round round-5\"></div>\r\n<div class=\"round round-6\"><a href=\"javascript:void(0)\" onclick=\"PostMessage();\">发表</a></div>\r\n<div class=\"round round-7\"><a href=\"?m=Login\">管理</a></div>\r\n</body></html>";
_end();delete _end;delete _echo;if(__buffer) return _contents;
</script>