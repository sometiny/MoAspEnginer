/*
** File: jazor.js
*/
var Jazor = require("./jazor.js");
var JazorExtends = require("./extends.js");
function path(file, base){
	if(file.substr(0, 1) == '/' || /^http(s)?\:\/\//.test(file)){
		return file;
	}
	file = (base || '') + file;
	file = file.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
	var reg = /\/([^\/]+)\/\.\.\//;
	while(reg.test(file)){
		file = file.replace(reg, '/');
	}
	file = file.replace(/\/(\.+)\//, '/');
	return file;
}
function loadtemplate(template){
	var templatelist  = template.split(":")
	var vpath, path, len = templatelist.length;
	if (templatelist.length == 1) {
		vpath = G.MO_TEMPLATE_NAME + "/" + Mo.Method + G.MO_TEMPLATE_SPLIT + template;
	} else if (templatelist.length == 2) {
		vpath = G.MO_TEMPLATE_NAME + "/" + template.replace(":", G.MO_TEMPLATE_SPLIT);
	} else if (templatelist.length == 3) {
		vpath = templatelist[0] + "/" + templatelist[1] + G.MO_TEMPLATE_SPLIT + templatelist[2];
	}
	path = G.MO_APP + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
	if (vpath.indexOf("@") > 0) path = G.MO_ROOT + vpath.substr(vpath.indexOf("@") + 1) + "/Views/" + vpath.substr(0, vpath.indexOf("@")) + "." + G.MO_TEMPLATE_PERX;
	if (!IO.file.exists(path)) path = G.MO_CORE + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
	if (!IO.file.exists(path)) {
		ExceptionManager.put(0x6300, "__LoadTemplate()", "template '" + template + "' is not exists.", E_NOTICE);
		return "";
	}
	return path;
}
var G = Mo.Config.Global;
module.exports = {
	compile_path : function(template){
		var codes = '';
		try{
			Jazor.config('trim_start', false);

			var file = loadtemplate(template);
			if(!file){
				return '';
			}
			var dir = file.substr(0, file.lastIndexOf('/') + 1);
			
			JazorExtends.compileas(IO.file.readAllText(file), function(file, fn){
				fn(IO.file.readAllText(path(file, dir)));
			});
			
			codes = JazorExtends.compile('default');
		}catch(ex){
			F.echo(ex);
			return '';
		}
		
		codes = codes.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
		return 'var codes = "' + codes + '"; var Jazor = require(\'views/jazor/jazor.js\');var result = Jazor.render(codes, $); if(__buffer) return result; Response.Write(result);';
	}
};