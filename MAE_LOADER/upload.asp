<!--#include file="maeloader.asp"-->
<%
require "net/http/upload"
dim httpupload
set httpupload = exports.net.http.upload.create("http://file.api.weixin.qq.com/cgi-bin/media/upload?access_token=sss&type=image")
httpupload.appendFile "media","btn.jpg","text/image"
httpupload.send()
Response.Write httpupload.gettext("utf-8")
%>