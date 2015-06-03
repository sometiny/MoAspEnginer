/*debug*/
/*
** File: io.js
** Usage: some methods for io
** About: 
**		support@mae.im
*/
/*find from internet, thanks!*/
var mapto437 = [], maptostring =[];
for(var i=0;i<128;i++){
	maptostring[i] = mapto437[i]=i;
}
mapto437[0x80] = 0x00c7;mapto437[0x81] = 0x00fc;mapto437[0x82] = 0x00e9;mapto437[0x83] = 0x00e2;mapto437[0x84] = 0x00e4;mapto437[0x85] = 0x00e0;mapto437[0x86] = 0x00e5;mapto437[0x87] = 0x00e7;mapto437[0x88] = 0x00ea;mapto437[0x89] = 0x00eb;mapto437[0x8a] = 0x00e8;mapto437[0x8b] = 0x00ef;mapto437[0x8c] = 0x00ee;mapto437[0x8d] = 0x00ec;mapto437[0x8e] = 0x00c4;mapto437[0x8f] = 0x00c5;mapto437[0x90] = 0x00c9;mapto437[0x91] = 0x00e6;mapto437[0x92] = 0x00c6;mapto437[0x93] = 0x00f4;mapto437[0x94] = 0x00f6;mapto437[0x95] = 0x00f2;mapto437[0x96] = 0x00fb;mapto437[0x97] = 0x00f9;mapto437[0x98] = 0x00ff;mapto437[0x99] = 0x00d6;mapto437[0x9a] = 0x00dc;mapto437[0x9b] = 0x00a2;mapto437[0x9c] = 0x00a3;mapto437[0x9d] = 0x00a5;mapto437[0x9e] = 0x20a7;mapto437[0x9f] = 0x0192;mapto437[0xa0] = 0x00e1;mapto437[0xa1] = 0x00ed;mapto437[0xa2] = 0x00f3;mapto437[0xa3] = 0x00fa;mapto437[0xa4] = 0x00f1;mapto437[0xa5] = 0x00d1;mapto437[0xa6] = 0x00aa;mapto437[0xa7] = 0x00ba;mapto437[0xa8] = 0x00bf;mapto437[0xa9] = 0x2310;mapto437[0xaa] = 0x00ac;mapto437[0xab] = 0x00bd;mapto437[0xac] = 0x00bc;mapto437[0xad] = 0x00a1;mapto437[0xae] = 0x00ab;mapto437[0xaf] = 0x00bb;mapto437[0xb0] = 0x2591;mapto437[0xb1] = 0x2592;mapto437[0xb2] = 0x2593;mapto437[0xb3] = 0x2502;mapto437[0xb4] = 0x2524;mapto437[0xb5] = 0x2561;mapto437[0xb6] = 0x2562;mapto437[0xb7] = 0x2556;mapto437[0xb8] = 0x2555;mapto437[0xb9] = 0x2563;mapto437[0xba] = 0x2551;mapto437[0xbb] = 0x2557;mapto437[0xbc] = 0x255d;mapto437[0xbd] = 0x255c;mapto437[0xbe] = 0x255b;mapto437[0xbf] = 0x2510;mapto437[0xc0] = 0x2514;mapto437[0xc1] = 0x2534;mapto437[0xc2] = 0x252c;mapto437[0xc3] = 0x251c;mapto437[0xc4] = 0x2500;mapto437[0xc5] = 0x253c;mapto437[0xc6] = 0x255e;mapto437[0xc7] = 0x255f;mapto437[0xc8] = 0x255a;mapto437[0xc9] = 0x2554;mapto437[0xca] = 0x2569;mapto437[0xcb] = 0x2566;mapto437[0xcc] = 0x2560;mapto437[0xcd] = 0x2550;mapto437[0xce] = 0x256c;mapto437[0xcf] = 0x2567;mapto437[0xd0] = 0x2568;mapto437[0xd1] = 0x2564;mapto437[0xd2] = 0x2565;mapto437[0xd3] = 0x2559;mapto437[0xd4] = 0x2558;mapto437[0xd5] = 0x2552;mapto437[0xd6] = 0x2553;mapto437[0xd7] = 0x256b;mapto437[0xd8] = 0x256a;mapto437[0xd9] = 0x2518;mapto437[0xda] = 0x250c;mapto437[0xdb] = 0x2588;mapto437[0xdc] = 0x2584;mapto437[0xdd] = 0x258c;mapto437[0xde] = 0x2590;mapto437[0xdf] = 0x2580;mapto437[0xe0] = 0x03b1;mapto437[0xe1] = 0x00df;mapto437[0xe2] = 0x0393;mapto437[0xe3] = 0x03c0;mapto437[0xe4] = 0x03a3;mapto437[0xe5] = 0x03c3;mapto437[0xe6] = 0x00b5;mapto437[0xe7] = 0x03c4;mapto437[0xe8] = 0x03a6;mapto437[0xe9] = 0x0398;mapto437[0xea] = 0x03a9;mapto437[0xeb] = 0x03b4;mapto437[0xec] = 0x221e;mapto437[0xed] = 0x03c6;mapto437[0xee] = 0x03b5;mapto437[0xef] = 0x2229;mapto437[0xf0] = 0x2261;mapto437[0xf1] = 0x00b1;mapto437[0xf2] = 0x2265;mapto437[0xf3] = 0x2264;mapto437[0xf4] = 0x2320;mapto437[0xf5] = 0x2321;mapto437[0xf6] = 0x00f7;mapto437[0xf7] = 0x2248;mapto437[0xf8] = 0x00b0;mapto437[0xf9] = 0x2219;mapto437[0xfa] = 0x00b7;mapto437[0xfb] = 0x221a;mapto437[0xfc] = 0x207f;mapto437[0xfd] = 0x00b2;mapto437[0xfe] = 0x25a0;mapto437[0xff] = 0x00a0;
maptostring[0xc7] = 0x80;maptostring[0xfc] = 0x81;maptostring[0xe9] = 0x82;maptostring[0xe2] = 0x83;maptostring[0xe4] = 0x84;maptostring[0xe0] = 0x85;maptostring[0xe5] = 0x86;maptostring[0xe7] = 0x87;maptostring[0xea] = 0x88;maptostring[0xeb] = 0x89;maptostring[0xe8] = 0x8a;maptostring[0xef] = 0x8b;maptostring[0xee] = 0x8c;maptostring[0xec] = 0x8d;maptostring[0xc4] = 0x8e;maptostring[0xc5] = 0x8f;maptostring[0xc9] = 0x90;maptostring[0xe6] = 0x91;maptostring[0xc6] = 0x92;maptostring[0xf4] = 0x93;maptostring[0xf6] = 0x94;maptostring[0xf2] = 0x95;maptostring[0xfb] = 0x96;maptostring[0xf9] = 0x97;maptostring[0xff] = 0x98;maptostring[0xd6] = 0x99;maptostring[0xdc] = 0x9a;maptostring[0xa2] = 0x9b;maptostring[0xa3] = 0x9c;maptostring[0xa5] = 0x9d;maptostring[0x20a7] = 0x9e;maptostring[0x192] = 0x9f;maptostring[0xe1] = 0xa0;maptostring[0xed] = 0xa1;maptostring[0xf3] = 0xa2;maptostring[0xfa] = 0xa3;maptostring[0xf1] = 0xa4;maptostring[0xd1] = 0xa5;maptostring[0xaa] = 0xa6;maptostring[0xba] = 0xa7;maptostring[0xbf] = 0xa8;maptostring[0x2310] = 0xa9;maptostring[0xac] = 0xaa;maptostring[0xbd] = 0xab;maptostring[0xbc] = 0xac;maptostring[0xa1] = 0xad;maptostring[0xab] = 0xae;maptostring[0xbb] = 0xaf;maptostring[0x2591] = 0xb0;maptostring[0x2592] = 0xb1;maptostring[0x2593] = 0xb2;maptostring[0x2502] = 0xb3;maptostring[0x2524] = 0xb4;maptostring[0x2561] = 0xb5;maptostring[0x2562] = 0xb6;maptostring[0x2556] = 0xb7;maptostring[0x2555] = 0xb8;maptostring[0x2563] = 0xb9;maptostring[0x2551] = 0xba;maptostring[0x2557] = 0xbb;maptostring[0x255d] = 0xbc;maptostring[0x255c] = 0xbd;maptostring[0x255b] = 0xbe;maptostring[0x2510] = 0xbf;maptostring[0x2514] = 0xc0;maptostring[0x2534] = 0xc1;maptostring[0x252c] = 0xc2;maptostring[0x251c] = 0xc3;maptostring[0x2500] = 0xc4;maptostring[0x253c] = 0xc5;maptostring[0x255e] = 0xc6;maptostring[0x255f] = 0xc7;maptostring[0x255a] = 0xc8;maptostring[0x2554] = 0xc9;maptostring[0x2569] = 0xca;maptostring[0x2566] = 0xcb;maptostring[0x2560] = 0xcc;maptostring[0x2550] = 0xcd;maptostring[0x256c] = 0xce;maptostring[0x2567] = 0xcf;maptostring[0x2568] = 0xd0;maptostring[0x2564] = 0xd1;maptostring[0x2565] = 0xd2;maptostring[0x2559] = 0xd3;maptostring[0x2558] = 0xd4;maptostring[0x2552] = 0xd5;maptostring[0x2553] = 0xd6;maptostring[0x256b] = 0xd7;maptostring[0x256a] = 0xd8;maptostring[0x2518] = 0xd9;maptostring[0x250c] = 0xda;maptostring[0x2588] = 0xdb;maptostring[0x2584] = 0xdc;maptostring[0x258c] = 0xdd;maptostring[0x2590] = 0xde;maptostring[0x2580] = 0xdf;maptostring[0x3b1] = 0xe0;maptostring[0xdf] = 0xe1;maptostring[0x393] = 0xe2;maptostring[0x3c0] = 0xe3;maptostring[0x3a3] = 0xe4;maptostring[0x3c3] = 0xe5;maptostring[0xb5] = 0xe6;maptostring[0x3c4] = 0xe7;maptostring[0x3a6] = 0xe8;maptostring[0x398] = 0xe9;maptostring[0x3a9] = 0xea;maptostring[0x3b4] = 0xeb;maptostring[0x221e] = 0xec;maptostring[0x3c6] = 0xed;maptostring[0x3b5] = 0xee;maptostring[0x2229] = 0xef;maptostring[0x2261] = 0xf0;maptostring[0xb1] = 0xf1;maptostring[0x2265] = 0xf2;maptostring[0x2264] = 0xf3;maptostring[0x2320] = 0xf4;maptostring[0x2321] = 0xf5;maptostring[0xf7] = 0xf6;maptostring[0x2248] = 0xf7;maptostring[0xb0] = 0xf8;maptostring[0x2219] = 0xf9;maptostring[0xb7] = 0xfa;maptostring[0x221a] = 0xfb;maptostring[0x207f] = 0xfc;maptostring[0xb2] = 0xfd;maptostring[0x25a0] = 0xfe;maptostring[0xa0] = 0xff;
/* Convert a octet number to a code page 437 char code */
var buffer2string = function(buffer) {
	var ret = "";
	var i = 0;
	var l = buffer.length;
	var cc;
	for (; i < l; ++i) {
		ret += String.fromCharCode(mapto437[buffer[i]]);
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
		buffer.push(maptostring[src.charCodeAt(i)]);
	}
	return buffer;
}
var string2binary = function(src) {
	var buffer = "";
	var i = 0;
	var l = src.length;
	var cc;
	for (; i < l; ++i) {
		buffer += String.fromCharCode(maptostring[src.charCodeAt(i)]);
	}
	return buffer;
}
var binary2string = function(src) {
	var ret = "";
	var i = 0;
	var l = src.length;
	var cc;
	for (; i < l; ++i) {
		ret += String.fromCharCode(mapto437[src.charCodeAt(i)]);
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
$io.string2buffer = string2buffer;
$io.buffer2string = buffer2string;
module.exports = $io;