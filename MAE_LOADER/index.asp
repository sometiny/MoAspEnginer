<!--#include file="maeloader.asp"-->
<%
Response.Charset="utf-8"
'======
'根据IP查地理位置
'======
echo "<h4>根据IP查地理位置</h4>"
require "qqwry"
set info = exports.qqwry("61.164.43.236")
echo F.format("{0}<br />{1}-{2}-{3}<br />{4}",info.location,info.state,info.city,info.area,info.address),true

'======
'JSON简单示例
'======
echo "<h4>JSON简单示例</h4>"
set data = JSON.create()
data.put("id", 1).put("name", "anlige").put "realname","艾恩"

data.putObject("other").put "nick","anlige"
data.put("info2",JSON.create()).put "hometown","sd"

data.putArray("list").put(1).put(2).put 3
data.put("list2",JSON.create(JSON.ARRAY)).put("haha").put("heihei").put "hoho"

echo data,true

'======
'md5
'======
echo "<h4>md5</h4>"
require "md5"
echo exports.md5("admin"),true

'======
'encoding
'======
echo "<h4>encoding</h4>"
require "encoding"
echo exports.md5_bytes(exports.encoding.gbk.getByteArray("测试")),true
echo exports.md5_bytes(exports.encoding.utf8.getByteArray("测试")),true
echo exports.md5_bytes(exports.encoding.unicode.getByteArray("测试")),true

'======
'punycode
'======
echo "<h4>punycode</h4>"
require "punycode"
echo exports.punycode.encode("中文域名"),true
echo exports.punycode.decode("fiq06l2rdsvs"),true
echo exports.punycode.toIDN("中文域名.中国"),true
echo exports.punycode.fromIDN("xn--fiq06l2rdsvs.xn--fiqs8s"),true

'======
'sha1
'======
echo "<h4>sha1</h4>"
require "sha1"
echo exports.sha1("admin"),true
echo exports.sha1("测试"),true
echo exports.sha1(exports.encoding.gbk.getByteArray("测试")),true
echo exports.sha1(exports.encoding.utf8.getByteArray("测试")),true

'======
'safecode/qrcode
'======
%>
<h4>验证码</h4>
<img src="safecode.asp" />
<h4>二维码</h4>
<img src="qrcode.asp" />