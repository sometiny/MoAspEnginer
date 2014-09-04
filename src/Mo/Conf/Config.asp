<script language="jscript" runat="server">
/*
** File: Config.asp
** Usage: global configures
**		you can define configure with a same name in your app's config file to override the follow configures;
** About: 
**		support@mae.im
*/
return {
	MO_ROOT : "",
	MO_APP_NAME : "App",
	MO_APP : "App/",
	MO_CORE : "Mo/",
	MO_CACHE: false,
	MO_CACHE_DIR : "",
	MO_TEMPLATE_NAME : "default",
	MO_TEMPLATE_SPLIT : "/",
	MO_TEMPLATE_PERX : "html",
	MO_TABLE_PERX : "Mo_",
	MO_DEBUG: true,
	MO_SHOW_SERVER_ERROR: true,
	MO_COMPILE_CACHE: true,
	MO_COMPILE_CACHE_EXPIRED : 0,
	MO_COMPILE_STRICT : false,
	MO_CHARSET : "UTF-8",
	MO_METHOD_CHAR : "m",
	MO_ACTION_CHAR : "a",
	MO_GROUP_CHAR : "g",
	MO_PRE_LIB : "",
	MO_TAG_LIB : "",
	MO_END_LIB : "",
	MO_DIRECT_OUTPUT : false,
	MO_LIB_CACHE : false,
	MO_REWRITE_MODE : "",
	MO_REWRITE_CONF : "",
	MO_PREETY_HTML : false,
	MO_APP_ENTRY : "",
	MO_MODEL_CACHE : false,
	MO_IMPORT_COMMON_FILES : "",
	MO_SESSION_WITH_SINGLE_TAG : false,
	MO_DISABLED_FUNCTIONS : "F.execute,F.include,F.initialize,F.globalize,F.require,executeglobal,execute,include,eval,IncludeFile,LoadVBScript,LoadScript,LoadFile,SaveFile,VBSExecute",
	MO_DISABLED_CONTROLLERS : "",
	MO_LOAD_VBSHELPER:true,
	MO_LANGUAGE:"cn",
	MO_PARSEACTIONPARMS:true
};
</script>