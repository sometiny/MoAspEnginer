<!--#include file="dist/maeloader.asp"-->
<%
require "qrcode"
set qr = exports.qrcode(0,"Q")
qr.useBestMaskPattern = true
qr.flush "http://mae.im",2
%>