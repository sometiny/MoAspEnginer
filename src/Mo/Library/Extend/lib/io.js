/*debug*/
/*
** File: io.js
** Usage: some methods for io
** About: 
**		support@mae.im
*/
/*find from internet, thanks!*/
var mapto437 = new Array();
var maptostring = new Array();
mapto437['80'] = 0x00c7;mapto437['81'] = 0x00fc;mapto437['82'] = 0x00e9;mapto437['83'] = 0x00e2;mapto437['84'] = 0x00e4;mapto437['85'] = 0x00e0;mapto437['86'] = 0x00e5;mapto437['87'] = 0x00e7;mapto437['88'] = 0x00ea;mapto437['89'] = 0x00eb;mapto437['8a'] = 0x00e8;mapto437['8b'] = 0x00ef;mapto437['8c'] = 0x00ee;mapto437['8d'] = 0x00ec;mapto437['8e'] = 0x00c4;mapto437['8f'] = 0x00c5;mapto437['90'] = 0x00c9;mapto437['91'] = 0x00e6;mapto437['92'] = 0x00c6;mapto437['93'] = 0x00f4;mapto437['94'] = 0x00f6;mapto437['95'] = 0x00f2;mapto437['96'] = 0x00fb;mapto437['97'] = 0x00f9;mapto437['98'] = 0x00ff;mapto437['99'] = 0x00d6;mapto437['9a'] = 0x00dc;mapto437['9b'] = 0x00a2;mapto437['9c'] = 0x00a3;mapto437['9d'] = 0x00a5;mapto437['9e'] = 0x20a7;mapto437['9f'] = 0x0192;mapto437['a0'] = 0x00e1;mapto437['a1'] = 0x00ed;mapto437['a2'] = 0x00f3;mapto437['a3'] = 0x00fa;mapto437['a4'] = 0x00f1;mapto437['a5'] = 0x00d1;mapto437['a6'] = 0x00aa;mapto437['a7'] = 0x00ba;mapto437['a8'] = 0x00bf;mapto437['a9'] = 0x2310;mapto437['aa'] = 0x00ac;mapto437['ab'] = 0x00bd;mapto437['ac'] = 0x00bc;mapto437['ad'] = 0x00a1;mapto437['ae'] = 0x00ab;mapto437['af'] = 0x00bb;mapto437['b0'] = 0x2591;mapto437['b1'] = 0x2592;mapto437['b2'] = 0x2593;mapto437['b3'] = 0x2502;mapto437['b4'] = 0x2524;mapto437['b5'] = 0x2561;mapto437['b6'] = 0x2562;mapto437['b7'] = 0x2556;mapto437['b8'] = 0x2555;mapto437['b9'] = 0x2563;mapto437['ba'] = 0x2551;mapto437['bb'] = 0x2557;mapto437['bc'] = 0x255d;mapto437['bd'] = 0x255c;mapto437['be'] = 0x255b;mapto437['bf'] = 0x2510;mapto437['c0'] = 0x2514;mapto437['c1'] = 0x2534;mapto437['c2'] = 0x252c;mapto437['c3'] = 0x251c;mapto437['c4'] = 0x2500;mapto437['c5'] = 0x253c;mapto437['c6'] = 0x255e;mapto437['c7'] = 0x255f;mapto437['c8'] = 0x255a;mapto437['c9'] = 0x2554;mapto437['ca'] = 0x2569;mapto437['cb'] = 0x2566;mapto437['cc'] = 0x2560;mapto437['cd'] = 0x2550;mapto437['ce'] = 0x256c;mapto437['cf'] = 0x2567;mapto437['d0'] = 0x2568;mapto437['d1'] = 0x2564;mapto437['d2'] = 0x2565;mapto437['d3'] = 0x2559;mapto437['d4'] = 0x2558;mapto437['d5'] = 0x2552;mapto437['d6'] = 0x2553;mapto437['d7'] = 0x256b;mapto437['d8'] = 0x256a;mapto437['d9'] = 0x2518;mapto437['da'] = 0x250c;mapto437['db'] = 0x2588;mapto437['dc'] = 0x2584;mapto437['dd'] = 0x258c;mapto437['de'] = 0x2590;mapto437['df'] = 0x2580;mapto437['e0'] = 0x03b1;mapto437['e1'] = 0x00df;mapto437['e2'] = 0x0393;mapto437['e3'] = 0x03c0;mapto437['e4'] = 0x03a3;mapto437['e5'] = 0x03c3;mapto437['e6'] = 0x00b5;mapto437['e7'] = 0x03c4;mapto437['e8'] = 0x03a6;mapto437['e9'] = 0x0398;mapto437['ea'] = 0x03a9;mapto437['eb'] = 0x03b4;mapto437['ec'] = 0x221e;mapto437['ed'] = 0x03c6;mapto437['ee'] = 0x03b5;mapto437['ef'] = 0x2229;mapto437['f0'] = 0x2261;mapto437['f1'] = 0x00b1;mapto437['f2'] = 0x2265;mapto437['f3'] = 0x2264;mapto437['f4'] = 0x2320;mapto437['f5'] = 0x2321;mapto437['f6'] = 0x00f7;mapto437['f7'] = 0x2248;mapto437['f8'] = 0x00b0;mapto437['f9'] = 0x2219;mapto437['fa'] = 0x00b7;mapto437['fb'] = 0x221a;mapto437['fc'] = 0x207f;mapto437['fd'] = 0x00b2;mapto437['fe'] = 0x25a0;mapto437['ff'] = 0x00a0;
maptostring['c7'] = 0x80;maptostring['fc'] = 0x81;maptostring['e9'] = 0x82;maptostring['e2'] = 0x83;maptostring['e4'] = 0x84;maptostring['e0'] = 0x85;maptostring['e5'] = 0x86;maptostring['e7'] = 0x87;maptostring['ea'] = 0x88;maptostring['eb'] = 0x89;maptostring['e8'] = 0x8a;maptostring['ef'] = 0x8b;maptostring['ee'] = 0x8c;maptostring['ec'] = 0x8d;maptostring['c4'] = 0x8e;maptostring['c5'] = 0x8f;maptostring['c9'] = 0x90;maptostring['e6'] = 0x91;maptostring['c6'] = 0x92;maptostring['f4'] = 0x93;maptostring['f6'] = 0x94;maptostring['f2'] = 0x95;maptostring['fb'] = 0x96;maptostring['f9'] = 0x97;maptostring['ff'] = 0x98;maptostring['d6'] = 0x99;maptostring['dc'] = 0x9a;maptostring['a2'] = 0x9b;maptostring['a3'] = 0x9c;maptostring['a5'] = 0x9d;maptostring['20a7'] = 0x9e;maptostring['192'] = 0x9f;maptostring['e1'] = 0xa0;maptostring['ed'] = 0xa1;maptostring['f3'] = 0xa2;maptostring['fa'] = 0xa3;maptostring['f1'] = 0xa4;maptostring['d1'] = 0xa5;maptostring['aa'] = 0xa6;maptostring['ba'] = 0xa7;maptostring['bf'] = 0xa8;maptostring['2310'] = 0xa9;maptostring['ac'] = 0xaa;maptostring['bd'] = 0xab;maptostring['bc'] = 0xac;maptostring['a1'] = 0xad;maptostring['ab'] = 0xae;maptostring['bb'] = 0xaf;maptostring['2591'] = 0xb0;maptostring['2592'] = 0xb1;maptostring['2593'] = 0xb2;maptostring['2502'] = 0xb3;maptostring['2524'] = 0xb4;maptostring['2561'] = 0xb5;maptostring['2562'] = 0xb6;maptostring['2556'] = 0xb7;maptostring['2555'] = 0xb8;maptostring['2563'] = 0xb9;maptostring['2551'] = 0xba;maptostring['2557'] = 0xbb;maptostring['255d'] = 0xbc;maptostring['255c'] = 0xbd;maptostring['255b'] = 0xbe;maptostring['2510'] = 0xbf;maptostring['2514'] = 0xc0;maptostring['2534'] = 0xc1;maptostring['252c'] = 0xc2;maptostring['251c'] = 0xc3;maptostring['2500'] = 0xc4;maptostring['253c'] = 0xc5;maptostring['255e'] = 0xc6;maptostring['255f'] = 0xc7;maptostring['255a'] = 0xc8;maptostring['2554'] = 0xc9;maptostring['2569'] = 0xca;maptostring['2566'] = 0xcb;maptostring['2560'] = 0xcc;maptostring['2550'] = 0xcd;maptostring['256c'] = 0xce;maptostring['2567'] = 0xcf;maptostring['2568'] = 0xd0;maptostring['2564'] = 0xd1;maptostring['2565'] = 0xd2;maptostring['2559'] = 0xd3;maptostring['2558'] = 0xd4;maptostring['2552'] = 0xd5;maptostring['2553'] = 0xd6;maptostring['256b'] = 0xd7;maptostring['256a'] = 0xd8;maptostring['2518'] = 0xd9;maptostring['250c'] = 0xda;maptostring['2588'] = 0xdb;maptostring['2584'] = 0xdc;maptostring['258c'] = 0xdd;maptostring['2590'] = 0xde;maptostring['2580'] = 0xdf;maptostring['3b1'] = 0xe0;maptostring['df'] = 0xe1;maptostring['393'] = 0xe2;maptostring['3c0'] = 0xe3;maptostring['3a3'] = 0xe4;maptostring['3c3'] = 0xe5;maptostring['b5'] = 0xe6;maptostring['3c4'] = 0xe7;maptostring['3a6'] = 0xe8;maptostring['398'] = 0xe9;maptostring['3a9'] = 0xea;maptostring['3b4'] = 0xeb;maptostring['221e'] = 0xec;maptostring['3c6'] = 0xed;maptostring['3b5'] = 0xee;maptostring['2229'] = 0xef;maptostring['2261'] = 0xf0;maptostring['b1'] = 0xf1;maptostring['2265'] = 0xf2;maptostring['2264'] = 0xf3;maptostring['2320'] = 0xf4;maptostring['2321'] = 0xf5;maptostring['f7'] = 0xf6;maptostring['2248'] = 0xf7;maptostring['b0'] = 0xf8;maptostring['2219'] = 0xf9;maptostring['b7'] = 0xfa;maptostring['221a'] = 0xfb;maptostring['207f'] = 0xfc;maptostring['b2'] = 0xfd;maptostring['25a0'] = 0xfe;maptostring['a0'] = 0xff;
/* Convert a octet number to a code page 437 char code */
var buffer2string = function(buffer) {
	var ret = "";
	var i = 0;
	var l = buffer.length;
	var cc;
	for (; i < l; ++i) {
		cc = buffer[i];
		if (cc >= 128) {
			cc = mapto437[cc.toString(16)];
		}
		ret += String.fromCharCode(cc);
	}
	return ret;
}
/* Convert a code page 437 char code to a octet number*/
var string2buffer = function(src) {
	var buffer = [];
	var i = 0;
	var l = src.length;
	var cc;
	for (; i < l; ++i) {
		cc = src.charCodeAt(i);
		if (cc >= 128) {
			cc = maptostring[cc.toString(16)];
		}
		buffer.push(cc);
	}
	return buffer;
}
var string2binary = function(src) {
	var buffer = "";
	var i = 0;
	var l = src.length;
	var cc;
	for (; i < l; ++i) {
		cc = src.charCodeAt(i);
		if (cc >= 128) {
			cc = maptostring[cc.toString(16)];
		}
		buffer += String.fromCharCode(cc);
	}
	return buffer;
}
var binary2string = function(src) {
	var ret = "";
	var i = 0;
	var l = src.length;
	var cc;
	for (; i < l; ++i) {
		cc = src.charCodeAt(i);
		if (cc >= 128) {
			cc = mapto437[cc.toString(16)];
		}
		ret += String.fromCharCode(cc);
	}
	return ret;
}

var $io = (function()
{
	var $Io = {};
	$Io.filesize = 0;
	$Io.is = function(path){if(path.length<2)return false; return path.substr(1,1)==":";};
	$Io.fso = F.fso || F.activex("scripting.filesystemobject");
	$Io.stream = function(mode,type)
	{
		var stream = F.activex("adodb.stream");stream.mode = mode ||3;stream.type = type||1;return stream;
	};
	$Io.fps=[];
	$Io.absolute = function(path)
	{
		path = F.mappath(path);
		return $Io.fso.GetAbsolutePathName(path);
	};
	$Io.base = function(path)
	{
		path = F.mappath(path);
		return $Io.fso.GetBaseName (path);
	};
	$Io.parent = function(path)
	{
		return $Io.fso.GetParentFolderName(F.mappath(path));
	};
	$Io.build = function(path,name)
	{
		return $Io.fso.GetAbsolutePathName($Io.fso.BuildPath(F.mappath(path),name));
	};
	$Io.get = function(path)
	{
		path = F.mappath(path);
		var src = null;
		if($Io.file.exists(path))
		{
			src = $Io.fso.getFile(path);
		}
		else if($Io.directory.exists(path))
		{
			src = $Io.fso.getFolder(path);
		}
		if(src==null)
		{
			ExceptionManager.put(0x2d1e,"io.get","file or directory is not exists.");
			return {};
		}
		return {
			attr : src.Attributes,
			toString : function(){return $Io.attr.toString(src.Attributes);},
			date : {
				created: src.DateCreated,
				accessed: src.DateLastAccessed,
				modified: src.DateLastModified
			},
			name : src.Name,
			path : src.Path,
			size : src.Size,
			type : src.Type,
			src : src
		};
	};
	$Io.attr = function(path,attr)
	{
		var b = $Io.get(path);
		if(!b.hasOwnProperty("src")) return -1;
		if(attr!==undefined)
		{
			if(attr & 8 || attr & 16 || attr & 64 || attr & 128)
			{
				ExceptionManager.put(0x2d0d,"io.attr","attributes value error.");
				return -1;
			}
			return b.src.Attributes = attr;
		}
		else
		{
			return b.src.Attributes;
		}
	};
	$Io.attr.add = function(path, attr)
	{
		var b = $Io.get(path);
		if(!b.hasOwnProperty("src")) return -1;
		if(!(b.src.Attributes & attr)) return b.src.Attributes |= attr;
		return -1;
	};
	$Io.attr.remove = function(path, attr)
	{
		var b = $Io.get(path);
		if(!b.hasOwnProperty("src")) return -1;
		if(b.src.Attributes & attr) return b.src.Attributes ^= attr;
		return -1;
	};
	$Io.attr.toString = function(attr)
	{
		var attrString = "";
		if(attr>0)
		{
			for(var i in $Io.attrs)
			{
				if(!$Io.attrs.hasOwnProperty(i))
				{
					continue;
				}
				if(attr & $Io.attrs[i])
				{
					attrString += i + ", ";
				}
			}
			if(attrString != "")
			{
				attrString = attrString.substr(0, attrString.length-2);
			}
		}
		else
		{
			attrString = "Normal";
		}
		return attrString;
	};
	return $Io;
})();

/*some methods for file*/
$io.file = $io.file || (function()
{
	var $file = {};
	var $fn = function(fp, content)
	{
		$file.write(fp,content);
		$file.flush(fp);
		$file.close(fp);
	};
	$file.get = function(path)
	{
		var src = null;
		path = F.mappath(path);
		if($io.fso.fileexists(path))
		{
			src = $io.fso.getFile(path);
		}else{
			ExceptionManager.put(0x2d1e,"io.file.get","file is not exists.");
		}
		return src;
	};
	$file.exists = function(path)
	{
		path = F.mappath(path);
		return $io.fso.fileexists(path);
	};
	$file.del = function(path)
	{
		if(!$file.exists(path)) return true;
		try
		{
			$io.fso.deletefile(F.mappath(path));
			return true;
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.file.del");
			return false;
		}
	};
	$file.copy = function(src, dest)
	{
		try
		{
			$io.fso.CopyFile(src, dest);
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.file.copy");
			return false;
		}
	};
	$file.move = function(src, dest){
		try
		{
			$io.fso.MoveFile(src, dest);
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.file.move");
			return false;
		}
	};
	$file.readAllText = function(path, encoding){
		var fp = $io.file.open(path,{forText : true, forRead : true , encoding : encoding || "utf-8"}); var content = $io.file.read(fp); $io.file.close(fp); 
		return content;
	};
	$file.readAllBuffer = function(path){
		var fp = $io.file.open(path,{forText : true, forRead : true , encoding : "437"}); var content = $io.file.read(fp); $io.file.close(fp); 
		return string2buffer(content);
	};
	$file.readAllTextBinary = function(path){
		var fp = $io.file.open(path,{forText : true, forRead : true , encoding : "437"}); var content = $io.file.read(fp); $io.file.close(fp); 
		return string2binary(content);
	};
	$file.readAllScript = function(path, encoding){
		var fp = $io.file.open(path,{forText : true, forRead : true , encoding : encoding || "utf-8"}); var content = $io.file.read(fp); $io.file.close(fp);
		return content.replace(new RegExp("^(\\s*)<s" + "cript(.+?)>(\\s*)","i"),"").replace(new RegExp("(\\s*)<\\/s" + "cript>(\\s*)$","i"),"");
	};
	$file.readAllBytes = function(path){
		var fp = $io.file.open(path,{forText : false, forRead : true}); var content = $io.file.read(fp);$io.file.close(fp);
		return content;
	};
	$file.writeAllBytes = function(path,content){
		$fn($file.open(path, {forText : false}), content);
	};
	$file.writeAllText = function(path,content,encoding){
		$fn($file.open(path, {encoding : encoding || "utf-8"}), content);
	};
	$file.writeAllBuffer = function(path,buffer){
		$fn($file.open(path, {encoding : "437"}), buffer2string(buffer));
	};
	$file.appendAllBytes = function(path,content){
		$fn($file.open(path, {forText : false, forAppend : true}), content);
	};
	$file.appendAllText = function(path,content,encoding){
		$fn($file.open(path, {encoding : encoding || "utf-8", forAppend : true}), content);
	};
	$file.open = function(path,opt)
	{
		$io.filesize = 0;
		path = F.mappath(path);
		var cfg = 
		{
			forAppend : false,
			forText : true,
			forRead : false,
			encoding : "utf-8"
		};
		F.extend(cfg, opt||{});
		var fp = $io.stream(3, cfg.forText ? 2 : 1);
		if(cfg.forText)
		{
			fp.charset=cfg.encoding;
		}
		fp.open();
		if($file.exists(path) && (cfg.forAppend || cfg.forRead))
		{
			fp.loadfromfile(path);
			$io.filesize = fp.size;
			if(cfg.forAppend)
			{
				fp.position = fp.size;
			}
		}
		$io.fps.push([fp,path,cfg]);
		return $io.fps.length-1;
	};
	$file.seek = function(fp,position)
	{
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d2e,"io.file.seek","file resource id is invalid.");
			return;
		}
		$io.fps[fp][0].position = position;
	};
	$file.write = function(fp,content)
	{
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d3e,"io.file.write","file resource id is invalid.");
			return;
		}
		try{
			if($io.fps[fp][2].forText)
			{
				$io.fps[fp][0].writeText(content);
			}
			else
			{
				$io.fps[fp][0].write(content);
			}
		}catch(ex){
			ExceptionManager.put(ex,"io.file.write");
		}
	};
	$file.writeBuffer = function(fp,content){
		return $file.write(fp, buffer2string(content));
	};
	$file.read = function(fp,length){
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d4e,"io.file.read","file resource id is invalid.");
			return null;
		}
		if($io.fps[fp][2].forText)
		{
			if(length) return $io.fps[fp][0].readText(length);
			return $io.fps[fp][0].readText();
		}
		else
		{
			if(length) return $io.fps[fp][0].read(length);
			return $io.fps[fp][0].read();
		}
	};
	$file.readBuffer = function(fp,length){
		return string2buffer($file.read(fp, length));
	};
	$file.flush = function(fp)
	{
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d5e,"io.file.flush","file resource id is invalid.");
			return;
		}
		fp = $io.fps[fp];
		try{
			fp[0].flush();
			fp[0].saveToFile(fp[1],2);
		}catch(ex){
			ExceptionManager.put(ex,"io.file.flush['" + F.string.right(fp[1],"\\") + "']");
		}
	};
	$file.close = function(fp){
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d6e,"io.file.close","file resource id is invalid.");
			return;
		}
		$io.fps[fp][0].close();
	};
	$file.extension = function(path)
	{
		return $io.fso.GetExtensionName(F.mappath(path));
	};
	return $file;
})();

/*some methods for directory*/
$io.directory = $io.directory || (function()
{
	var $dir = {};
	$dir.get = function(path)
	{
		var src = null;
		if($io.fso.folderexists(path))
		{
			src = $io.fso.getFolder(path);
		}else{
			ExceptionManager.put(0x2d1e,"io.directory.get","directory is not exists.");
		}
		return src;
	};
	$dir.exists = function(path)
	{
		path = F.mappath(path);
		return $io.fso.folderexists(path);
	};
	$dir.del = function(path)
	{
		if(!$dir.exists(path)) return true;
		try
		{
			$io.fso.deletefolder(F.mappath(path));
			return true;
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.del");
			return false;
		}
	};
	$dir.copy = function(src, dest)
	{
		try
		{
			$io.fso.CopyFolder(src, dest);
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.copy");
			return false;
		}
	};
	$dir.move = function(src, dest)
	{
		try
		{
			$io.fso.MoveFolder(src, dest);
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.move");
			return false;
		}
	};
	$dir.create = function(path)
	{
		path = F.mappath(path);
		if($dir.exists(path))
		{
			return true;
		}
		var parent = $io.fso.GetParentFolderName(path);
		if(!$dir.exists(parent))
		{
			$dir.create(parent);
		}
		try
		{
			$io.fso.CreateFolder(path);
			return true;
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.create");
			return false;
		}
	};
	$dir.clear = function(path, filter)
	{
		path = F.mappath(path);
		var isFunc = (typeof filter == "function");
		if(!$dir.exists(path))
		{
			return false;
		}
		try
		{
			$dir.files(path, function(f){
				if(isFunc){
					if(filter(f,true)!==false)f.Delete();
				}else{
					f.Delete();
				}
			});
			$dir.directories(path, function(f){
				if(isFunc){
					if(filter(f,false)!==false)f.Delete();
				}else{
					f.Delete();
				}
			});
			return true;	
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.clear");
			return false;	
		}
	};
	$dir.files = function(path,callback)
	{
		if(!$dir.exists(path))
		{
			return [];
		}
		var files=[];
		path = F.mappath(path);
		var fc = new Enumerator($io.fso.getFolder(path).files);
		var isFunc = (typeof callback == "function");
		for (;!fc.atEnd(); fc.moveNext())
		{
			if(isFunc) callback(fc.item());
			else files.push(fc.item().path);
		}
		return files;
	};
	$dir.directories = function(path,callback)
	{
		if(!$dir.exists(path)) return [];
		var files=[];
		path = F.mappath(path);
		var fc = new Enumerator($io.fso.getFolder(path).subfolders);
		var isFunc = (typeof callback == "function");
		for (;!fc.atEnd(); fc.moveNext())
		{
			if(isFunc) callback(fc.item());
			else files.push(fc.item().path);
		}
		return files;
	};
	$dir.windows = $io.fso.GetSpecialFolder(0);
	$dir.system = $io.fso.GetSpecialFolder(1);
	$dir.temp = $io.fso.GetSpecialFolder(2);
	return $dir;
})();

/*some methods for drive*/
$io.drive = $io.drive || function(path)
{
	path = F.mappath(path);
	var dr = $io.fso.GetDrive($io.fso.GetDriveName(path));
	return {
		space : {
			available : dr.AvailableSpace,
			free : dr.FreeSpace,
			total : dr.TotalSize
		},
		letter : dr.DriveLetter,
		type : dr.DriveType,
		typeString : $io.drive.types[dr.DriveType] || "Unknown",
		fileSystem : dr.FileSystem,
		isReady : dr.IsReady,
		path : dr.Path,
		sn : (dr.SerialNumber < 0 ? (dr.SerialNumber+0x100000000) : dr.SerialNumber).toString(16)
	};
};
$io.drive.types = [
	"Unknown", 
	"Removable", 
	"Fixed", 
	"Network", 
	"CDROM", 
	"RAM"
];
$io.attrs = {
	Normal : 0, 
	ReadOnly : 1, 
	Hidden : 2, 
	System : 4, 
	Volume : 8, 
	Directory : 16, 
	Archive : 32, 
	Alias : 64, 
	Compressed : 128
};
$io.directory.attr = $io.file.attr = $io.attr;
$io.directory.base = $io.file.base = $io.base;
$io.directory.absolute = $io.file.absolute = $io.absolute;
$io.directory.parent = $io.file.parent = $io.parent;
$io.binary2buffer = function(bin){
	return F.activex("ADODB.STREAM", function(data){
		var byts;
		this.Mode = 3; this.Type = 1;
		this.Open();
		this.Write(data);
		this.Position = 0;
		this.Type = 2;
		this.CharSet = 437;
		byts = this.ReadText();
		this.Close();
		return string2buffer(byts);
	}, bin);
};
$io.buffer2binary = function(bin){
	return F.activex("ADODB.STREAM", function(data){
		var byts;
		this.Mode = 3;
		this.Type = 2;
		this.CharSet = 437;
		this.Open();
		this.WriteText(buffer2string(data));
		this.Position = 0;
		this.Type = 1;
		byts = this.Read();
		this.Close();
		return byts;
	}, bin);
};
module.exports = $io;