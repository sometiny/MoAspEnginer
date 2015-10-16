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
	MO_APP_ENTRY : "",
	MO_APP : "App/",
	MO_CORE : "Mo/",
	MO_CACHE: false,
	MO_CACHE_DIR : "",
	MO_TEMPLATE_NAME : "default",
	MO_TEMPLATE_SPLIT : "/",
	MO_TEMPLATE_PERX : "html",
	MO_TEMPLATE_ENGINE : "views/view2.js",
	MO_TABLE_PERX : "Mo_",
	MO_DEBUG: false,
	MO_DEBUG_MODE: "DIRECT",
	MO_DEBUG_FILE : "",
	MO_COMPILE_CACHE : true,
	MO_INGORE_COMPILE_CACHE : false,
	MO_COMPILE_CACHE_EXPIRED : 0,
	MO_CHARSET : "utf-8",
	MO_CONTENT_TYPE : "",
	MO_METHOD_CHAR : "m",
	MO_ACTION_CHAR : "a",
	MO_GROUP_CHAR : "g",
	MO_PRE_LIB : "",
	MO_TAG_LIB : "",
	MO_END_LIB : "",
	MO_ROUTE_REST_ENABLED : false,
	MO_ROUTE_MODE : "",
	MO_ROUTE_URL_EXT : "html",
	MO_ROUTE_MAPS : {},
	MO_ROUTE_RULES : [],
	MO_KEEP_PARAMS_WHEN_REWRITE : true,
	MO_PREETY_HTML : false,
	MO_MODEL_CACHE : false,
	MO_IMPORT_COMMON_FILES : "",
	MO_SESSION_WITH_SINGLE_TAG : false,
	MO_DISABLED_FUNCTIONS : "F.initialize,F.globalize,require,executeglobal,execute,include,eval",
	MO_LOAD_VBSHELPER : true,
	MO_LANGUAGE : "cn",
	MO_PARSEACTIONPARMS : false,
	MO_CONTROLLER_CNAMES : null,
	MO_ACTION_CASE_SENSITIVITY : true,
	MO_AUTO_DISPLAY : false,
	MO_ERROR_REPORTING : E_NONE,
	MO_LIB_CNAMES : {
		"base64" : "assets/base64.js",
		"md5" : "assets/md5.js",
		"tar" : "assets/tar.js",
		"dump" : "assets/dump.js"
	},
	MO_MPI_HOST : "mpi.thinkasp.cn"
};
</script>