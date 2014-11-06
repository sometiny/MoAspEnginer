<script language="jscript" runat="server">
if(typeof Mo=="undefined"){Response.Write("invalid call.");Response.End();}
function Temp___(){
var WriteStreamText=function(st,txt){if(txt==null)txt="";txt=txt.toString();st.WriteText(txt);};
var TplStream = F.activex.stream();
TplStream.Mode=3;
TplStream.Type=2;
TplStream.Charset=Mo.Config.Global.MO_CHARSET;
TplStream.Open();
WriteStreamText(TplStream,"<!DOCTYPE html>\r\n");
WriteStreamText(TplStream,"<html lang=\"zh-cn\" dir=\"ltr\">\r\n");
WriteStreamText(TplStream,"<head>\r\n");
WriteStreamText(TplStream,"<meta charset=\"UTF-8\" />\r\n");
WriteStreamText(TplStream,"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\r\n");
WriteStreamText(TplStream,"<!--<meta name=\"viewport\" content=\"width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no\" />-->\r\n");
WriteStreamText(TplStream,"<title>");
WriteStreamText(TplStream,Mo.values("System","SubTitle"));
WriteStreamText(TplStream,"-");
WriteStreamText(TplStream,Mo.values("System","Title"));
WriteStreamText(TplStream,"</title>\r\n");
WriteStreamText(TplStream,"<link rel=\"stylesheet\" type=\"text/css\" href=\"/Contents/Css/reset.css\" />\r\n");
WriteStreamText(TplStream,"<link rel=\"stylesheet\" type=\"text/css\" href=\"/Contents/Css/style.css\" />\r\n");
WriteStreamText(TplStream,"<script type=\"text/javascript\" src=\"/Contents/Scripts/f.js\"></script>\r\n");
WriteStreamText(TplStream,"<script type=\"text/javascript\" src=\"/Contents/Scripts/f.e.js\"></script>\r\n");
WriteStreamText(TplStream,"<script type=\"text/javascript\" src=\"/Contents/Scripts/f.ajax.js\"></script>\r\n");
WriteStreamText(TplStream,"<script type=\"text/javascript\" src=\"/Contents/Scripts/common.js\"></script>\r\n");
WriteStreamText(TplStream,"</head>\r\n");
WriteStreamText(TplStream,"<body>\r\n");
WriteStreamText(TplStream,"<div id=\"wapper\">\r\n");
WriteStreamText(TplStream,"	<div id=\"wapper-header-top\">");
WriteStreamText(TplStream,Mo.values("System","Notice"));
WriteStreamText(TplStream,"</div>\r\n");
WriteStreamText(TplStream,"	<div id=\"wapper-header\">\r\n");
WriteStreamText(TplStream,"		<h3>");
WriteStreamText(TplStream,Mo.values("System","Title"));
WriteStreamText(TplStream,"</h3>\r\n");
WriteStreamText(TplStream,"		<h4>");
WriteStreamText(TplStream,Mo.values("System","SubTitle"));
WriteStreamText(TplStream,"</h4>\r\n");
WriteStreamText(TplStream,"	</div>\r\n");
WriteStreamText(TplStream,"	<div id=\"wapper-body\">\r\n");
WriteStreamText(TplStream,"		<div class=\"list-box clearfix\">\r\n");
WriteStreamText(TplStream,"			<ul class=\"clearfix\">\r\n");
WriteStreamText(TplStream,"				<li");
if(is_empty(F.get.int("Id",0))){
WriteStreamText(TplStream," class=\"hover\"");
}
WriteStreamText(TplStream,"><a href=\"/\">首页</a></li>\r\n");
WriteStreamText(TplStream,"				");
if(Mo.Assigns.hasOwnProperty("Forum")){
D__Forum = Mo.Assigns["Forum"];
D__Forum.reset();
K__Forum=D__Forum.pagesize *(D__Forum.currentpage-1);
D__Forum.each(function(C__Forum){
K__Forum=K__Forum+1;
WriteStreamText(TplStream,"\r\n");
WriteStreamText(TplStream,"				<li rel=\"");
WriteStreamText(TplStream,C__Forum.getter__("Tag"));
WriteStreamText(TplStream,":");
WriteStreamText(TplStream,C__Forum.getter__("Title"));
WriteStreamText(TplStream,"\"");
if(C__Forum.getter__("Tag") == F.get.int("Id",0)){
WriteStreamText(TplStream," class=\"hover\"");
}
WriteStreamText(TplStream,"><a href=\"?Id=");
WriteStreamText(TplStream,C__Forum.getter__("Tag"));
WriteStreamText(TplStream,"\">");
WriteStreamText(TplStream,C__Forum.getter__("Title"));
WriteStreamText(TplStream,"</a></li>\r\n");
WriteStreamText(TplStream,"				");
});}
WriteStreamText(TplStream,"\r\n");
WriteStreamText(TplStream,"			</ul>\r\n");
WriteStreamText(TplStream,"		</div>\r\n");
WriteStreamText(TplStream,"<div class=\"box-forum\"><h4>当前版块：");
WriteStreamText(TplStream,F.encodeHtml(Mo.values("ForumInfo","Title")));
WriteStreamText(TplStream,"</h4><h5>");
WriteStreamText(TplStream,F.encodeHtml(Mo.values("ForumInfo","Description")));
WriteStreamText(TplStream,"</h5></div>\r\n");
if(Mo.Assigns.hasOwnProperty("Thread")){
D__Thread = Mo.Assigns["Thread"];
D__Thread.reset();
K__Thread=D__Thread.pagesize *(D__Thread.currentpage-1);
D__Thread.each(function(C__Thread){
K__Thread=K__Thread+1;
WriteStreamText(TplStream,"\r\n");
WriteStreamText(TplStream,"<div class=\"content-box\">\r\n");
WriteStreamText(TplStream,"	<h5>Post By '");
WriteStreamText(TplStream,C__Thread.getter__("PostFrom"));
WriteStreamText(TplStream,"', At '");
WriteStreamText(TplStream,C__Thread.getter__("PostIp"));
WriteStreamText(TplStream,"', On '");
WriteStreamText(TplStream,F.untimespan(C__Thread.getter__("PostDate")));
WriteStreamText(TplStream,"' About '<a href=\"?Id=");
WriteStreamText(TplStream,C__Thread.getter__("ForumTag"));
WriteStreamText(TplStream,"\">");
WriteStreamText(TplStream,C__Thread.getter__("ForumName"));
WriteStreamText(TplStream,"</a>'</h5>\r\n");
WriteStreamText(TplStream,"	<h4><a href=\"?a=thread&Id=");
WriteStreamText(TplStream,C__Thread.getter__("Id"));
WriteStreamText(TplStream,"\">");
if(C__Thread.getter__("IsReplied") == 1){
WriteStreamText(TplStream,"【已回复】");
}
WriteStreamText(TplStream,C__Thread.getter__("Title"));
WriteStreamText(TplStream,"</a></h4>\r\n");
WriteStreamText(TplStream,"	<div class=\"content\">");
WriteStreamText(TplStream,C__Thread.getter__("Description"));
WriteStreamText(TplStream,"</div>\r\n");
WriteStreamText(TplStream,"	");
if(C__Thread.getter__("IsReplied") == 1){
WriteStreamText(TplStream,"<div class=\"reply\"><quot>");
WriteStreamText(TplStream,Mo.A("Home").GetReply(C__Thread.getter__("Id")));
WriteStreamText(TplStream,"</quot></div>");
}
WriteStreamText(TplStream,"\r\n");
WriteStreamText(TplStream,"</div>\r\n");
});}
WriteStreamText(TplStream,"\r\n");
if( !is_empty(F.get.int("Id",0))){
WriteStreamText(TplStream,"<div id=\"wapper-page\">");
if(Mo.Assigns.hasOwnProperty("Thread")){
WriteStreamText(TplStream,CreatePageList("",D__Thread.recordcount,D__Thread.pagesize,D__Thread.currentpage));
}
WriteStreamText(TplStream,"</div>");
}
WriteStreamText(TplStream,"\r\n");
WriteStreamText(TplStream,"<script type=\"text/javascript\">\r\n");
WriteStreamText(TplStream,"var html = '';\r\n");
WriteStreamText(TplStream,"html += '<form action=\"?a=postmessage\" method=\"post\" onsubmit=\"return false;\" name=\"postmessageform\">';\r\n");
WriteStreamText(TplStream,"html += '<label>版块：</label>';\r\n");
WriteStreamText(TplStream,"html += '<select name=\"ForumTag\">';\r\n");
WriteStreamText(TplStream,"F(\"li[rel]\").each(function(){\r\n");
WriteStreamText(TplStream,"	var rel = F(this).attr(\"rel\").split(\":\");\r\n");
WriteStreamText(TplStream,"	html += '<option value=\"'+ rel[0] +'\">'+ rel[1] +'</option>';\r\n");
WriteStreamText(TplStream,"});\r\n");
WriteStreamText(TplStream,"html += '</select>';\r\n");
WriteStreamText(TplStream,"html += '<label>名字：</label><input type=\"text\" name=\"PostFrom\" class=\"width_200\" value=\"#匿名#\" /> 您的名字。';\r\n");
WriteStreamText(TplStream,"html += '<label>邮箱：</label><input type=\"text\" name=\"PostEmail\" class=\"width_200\" /> *您的邮箱。';\r\n");
WriteStreamText(TplStream,"html += '<label>主页：</label><input type=\"text\" name=\"PostHomepage\" class=\"width_200\" /> 您的主页。';\r\n");
WriteStreamText(TplStream,"html += '<label>标题：</label><input type=\"text\" name=\"Title\" class=\"width_200\" /> *留言标题，不超过50字。';\r\n");
WriteStreamText(TplStream,"html += '<label>内容：</label><textarea cols=\"60\" rows=\"4\" name=\"Description\"></textarea> *留言内容，不超过1000字';\r\n");
WriteStreamText(TplStream,"html += '<label>验证码：</label><input type=\"text\" name=\"SafeCode\" /> <img src=\"?a=code\" onclick=\"this.src=\\'?a=code&_t=\\'+Math.random();\" style=\"cursor:pointer\" />';\r\n");
WriteStreamText(TplStream,"html += '</form>';\r\n");
WriteStreamText(TplStream,"function PostMessage(){\r\n");
WriteStreamText(TplStream,"	F(\"#DialogAlert\").attr(\"title\",\"发表留言\").html(html).dialog({\r\n");
WriteStreamText(TplStream,"		\"width\":575,\"height\":600,\"maxHeight\":600,buttons:{\r\n");
WriteStreamText(TplStream,"			\"立即发表\":function(){\r\n");
WriteStreamText(TplStream,"				Ajax({\r\n");
WriteStreamText(TplStream,"					form:document.forms[\"postmessageform\"],\r\n");
WriteStreamText(TplStream,"					succeed:function(msg){\r\n");
WriteStreamText(TplStream,"						ShowTips(\"提示\",msg.replace(/\\n/igm,\"<br />\"));\r\n");
WriteStreamText(TplStream,"						if(msg==\"留言发表成功。\")window.setTimeout(function(){window.location.reload();}, 1000);\r\n");
WriteStreamText(TplStream,"					}\r\n");
WriteStreamText(TplStream,"				});\r\n");
WriteStreamText(TplStream,"				return false;\r\n");
WriteStreamText(TplStream,"			}\r\n");
WriteStreamText(TplStream,"		}\r\n");
WriteStreamText(TplStream,"	});\r\n");
WriteStreamText(TplStream,"}\r\n");
WriteStreamText(TplStream,"</script>\r\n");
WriteStreamText(TplStream,"<div id=\"DialogAlert\"></div>\r\n");
WriteStreamText(TplStream,"	</div>\r\n");
WriteStreamText(TplStream,"	<div id=\"wapper-foot\">");
WriteStreamText(TplStream,Mo.values("System","CopyRight"));
WriteStreamText(TplStream,"&nbsp;<a href=\"http://m.thinkasp.cn/\" target=\"_blank\">MAE官网</a></div>\r\n");
WriteStreamText(TplStream,"</div>\r\n");
WriteStreamText(TplStream,"<div class=\"round round-1\"></div>\r\n");
WriteStreamText(TplStream,"<div class=\"round round-2\"></div>\r\n");
WriteStreamText(TplStream,"<div class=\"round round-3\"></div>\r\n");
WriteStreamText(TplStream,"<div class=\"round round-4\"></div>\r\n");
WriteStreamText(TplStream,"<div class=\"round round-5\"></div>\r\n");
WriteStreamText(TplStream,"<div class=\"round round-6\"><a href=\"javascript:void(0)\" onclick=\"PostMessage();\">发表</a></div>\r\n");
WriteStreamText(TplStream,"<div class=\"round round-7\"><a href=\"?m=Login\">管理</a></div>\r\n");
WriteStreamText(TplStream,"</body></html>");
TplStream.Position=0;
var Temp____ = TplStream.ReadText();
TplStream.Close();
delete WriteStreamText;
return Temp____;
}
</script>