<script language="jscript" runat="server">
QRCodeController = IController.create();
QRCodeController.extend("Index",function(){
	/*todo*/
	var QR = require("qrcode");
	if(!QR){
		F.echo("模块qrcode不存在，需要安装。",true);
		return;
	}
	var qr = QR(0,"Q");
	qr.useBestMaskPattern = true;
	qr.flush("为新Controller对象扩展一个新方法，对应相应的动作",2);
});
</script>