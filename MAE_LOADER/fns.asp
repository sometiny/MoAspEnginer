<!--#include file="dist/maeloader.asp"-->
<%
Response.Charset="utf-8"
require "encoding"
'======
'根据IP查地理位置
'=======
echo "<h3><a href=""default.asp"">首页</a> 更多方法，参考：<a href=""http://mae.im/"" target=""_blank"">http://mae.im/</a></h3>"
echo "<h4>F.format</h4>"
echo F.format("my name is {0}, {1} years old. Today is {2:yyyy-MM-dd HH:mm:ss}","anlige",23,now())

echo "<h4>F.encode/decode</h4>"
echo F.encode("测试ASP"),true
echo F.decode("%E6%B5%8B%E8%AF%95ASP")

echo "<h4>F.date.parse</h4>"
F.dump F.date.parse(now())

echo "<h4>F.date</h4>"
echo F.date(now()).toString(),true
echo F.date(#2015-3-8 23:59:59#).toString("yyyy-MM-dd HH:mm:ss")

echo "<h4>F.date.format/F.formatdate</h4>"
echo F.date.format(#2015-3-8 23:59:59#,"yyyy-MM-dd HH:mm:ss"),true
echo F.formatdate(#2015-3-8 23:59:59#,"yyyy-MM-dd HH:mm:ss"),true
echo F.format("{0:yyyy-MM-dd HH:mm:ss}",#2015-3-8 23:59:59#)

echo "<h4>F.json</h4>"
F.json "{a:1,b:2}","jsondata"
echo F.format("data: {0.a}, {0.b}",jsondata)

echo "<h4>F.guid</h4>"
echo F.guid(),true
echo F.guid("N"),true
echo F.guid("D"),true
echo F.guid("P"),true
echo F.guid("B"),true

echo "<h4>F.base64</h4>"
echo F.base64.encode("admin"),true
echo F.base64.decode("YWRtaW4="),true
echo F.base64.encode("测试"),true
echo F.base64.decode("5rWL6K+V"),true
echo F.base64.e(exports.encoding.gbk.getByteArray("测试")),true
echo exports.encoding.gbk.getString(F.base64.d("suLK1A==")),true

echo "<h4>F.lambda 如果懂点js，可以用用</h4>"
F.dump F.lambda("src => return /^(\w+?)(?:\d+)(\w+?)(\d+)(\w+)$/igm.exec(src)")("asdsadsad2323sadsada232asdsa")

echo "<h4>F.random</h4>"
echo F.random(),true
echo F.random(1000),true
echo F.random(1000,9999),true
echo F.random.word(10),true
echo F.random.number(10),true
echo F.random.letter(10),true
echo F.random.hex(10),true
echo F.random.mix(10),true
echo F.random.initialize("四大撒旦法师打发阿斯顿公司大风歌sadfsdafsdaf",10),true

echo "<h4>F.activex</h4>"
echo F.activex.enabled("scripting.dictionary"),true
echo F.activex.enabled("scripting.dictionary1"),true
set com = F.activex("scripting.dictionary")
com("name") = "anlige"
echo com("name")
echo ExceptionManager.debug()
%>