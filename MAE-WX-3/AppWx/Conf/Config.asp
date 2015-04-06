<script language="jscript" runat="server">
return {
	MO_ERROR_REPORTING : E_NONE,
	MO_DEBUG : false,
	MO_DEBUG2FILE : false,
	MO_DEBUG_FILE : IO.build(F.mappath(Mo.Config.Global.MO_APP), "Controllers\\DEBUGS\\DEBUG.log"),
	WX : {
		srcid : "原始ID",
		token : "Token",
		appid : "应用AppID",
		appsecret : "应用AppSecret",
		aeskey : "安全模式的AES密码",
		maxrequestlength : 4096,
		txkey : ""
	}
};
</script>