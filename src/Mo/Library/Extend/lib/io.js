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
mapto437['80'] = '00c7';mapto437['81'] = '00fc';mapto437['82'] = '00e9';mapto437['83'] = '00e2';mapto437['84'] = '00e4';mapto437['85'] = '00e0';mapto437['86'] = '00e5';mapto437['87'] = '00e7';mapto437['88'] = '00ea';mapto437['89'] = '00eb';mapto437['8a'] = '00e8';mapto437['8b'] = '00ef';mapto437['8c'] = '00ee';mapto437['8d'] = '00ec';mapto437['8e'] = '00c4';mapto437['8f'] = '00c5';mapto437['90'] = '00c9';mapto437['91'] = '00e6';mapto437['92'] = '00c6';mapto437['93'] = '00f4';mapto437['94'] = '00f6';mapto437['95'] = '00f2';mapto437['96'] = '00fb';mapto437['97'] = '00f9';mapto437['98'] = '00ff';mapto437['99'] = '00d6';mapto437['9a'] = '00dc';mapto437['9b'] = '00a2';mapto437['9c'] = '00a3';mapto437['9d'] = '00a5';mapto437['9e'] = '20a7';mapto437['9f'] = '0192';mapto437['a0'] = '00e1';mapto437['a1'] = '00ed';mapto437['a2'] = '00f3';mapto437['a3'] = '00fa';mapto437['a4'] = '00f1';mapto437['a5'] = '00d1';mapto437['a6'] = '00aa';mapto437['a7'] = '00ba';mapto437['a8'] = '00bf';mapto437['a9'] = '2310';mapto437['aa'] = '00ac';mapto437['ab'] = '00bd';mapto437['ac'] = '00bc';mapto437['ad'] = '00a1';mapto437['ae'] = '00ab';mapto437['af'] = '00bb';mapto437['b0'] = '2591';mapto437['b1'] = '2592';mapto437['b2'] = '2593';mapto437['b3'] = '2502';mapto437['b4'] = '2524';mapto437['b5'] = '2561';mapto437['b6'] = '2562';mapto437['b7'] = '2556';mapto437['b8'] = '2555';mapto437['b9'] = '2563';mapto437['ba'] = '2551';mapto437['bb'] = '2557';mapto437['bc'] = '255d';mapto437['bd'] = '255c';mapto437['be'] = '255b';mapto437['bf'] = '2510';mapto437['c0'] = '2514';mapto437['c1'] = '2534';mapto437['c2'] = '252c';mapto437['c3'] = '251c';mapto437['c4'] = '2500';mapto437['c5'] = '253c';mapto437['c6'] = '255e';mapto437['c7'] = '255f';mapto437['c8'] = '255a';mapto437['c9'] = '2554';mapto437['ca'] = '2569';mapto437['cb'] = '2566';mapto437['cc'] = '2560';mapto437['cd'] = '2550';mapto437['ce'] = '256c';mapto437['cf'] = '2567';mapto437['d0'] = '2568';mapto437['d1'] = '2564';mapto437['d2'] = '2565';mapto437['d3'] = '2559';mapto437['d4'] = '2558';mapto437['d5'] = '2552';mapto437['d6'] = '2553';mapto437['d7'] = '256b';mapto437['d8'] = '256a';mapto437['d9'] = '2518';mapto437['da'] = '250c';mapto437['db'] = '2588';mapto437['dc'] = '2584';mapto437['dd'] = '258c';mapto437['de'] = '2590';mapto437['df'] = '2580';mapto437['e0'] = '03b1';mapto437['e1'] = '00df';mapto437['e2'] = '0393';mapto437['e3'] = '03c0';mapto437['e4'] = '03a3';mapto437['e5'] = '03c3';mapto437['e6'] = '00b5';mapto437['e7'] = '03c4';mapto437['e8'] = '03a6';mapto437['e9'] = '0398';mapto437['ea'] = '03a9';mapto437['eb'] = '03b4';mapto437['ec'] = '221e';mapto437['ed'] = '03c6';mapto437['ee'] = '03b5';mapto437['ef'] = '2229';mapto437['f0'] = '2261';mapto437['f1'] = '00b1';mapto437['f2'] = '2265';mapto437['f3'] = '2264';mapto437['f4'] = '2320';mapto437['f5'] = '2321';mapto437['f6'] = '00f7';mapto437['f7'] = '2248';mapto437['f8'] = '00b0';mapto437['f9'] = '2219';mapto437['fa'] = '00b7';mapto437['fb'] = '221a';mapto437['fc'] = '207f';mapto437['fd'] = '00b2';mapto437['fe'] = '25a0';mapto437['ff'] = '00a0';
maptostring['c7'] = '80';maptostring['fc'] = '81';maptostring['e9'] = '82';maptostring['e2'] = '83';maptostring['e4'] = '84';maptostring['e0'] = '85';maptostring['e5'] = '86';maptostring['e7'] = '87';maptostring['ea'] = '88';maptostring['eb'] = '89';maptostring['e8'] = '8a';maptostring['ef'] = '8b';maptostring['ee'] = '8c';maptostring['ec'] = '8d';maptostring['c4'] = '8e';maptostring['c5'] = '8f';maptostring['c9'] = '90';maptostring['e6'] = '91';maptostring['c6'] = '92';maptostring['f4'] = '93';maptostring['f6'] = '94';maptostring['f2'] = '95';maptostring['fb'] = '96';maptostring['f9'] = '97';maptostring['ff'] = '98';maptostring['d6'] = '99';maptostring['dc'] = '9a';maptostring['a2'] = '9b';maptostring['a3'] = '9c';maptostring['a5'] = '9d';maptostring['20a7'] = '9e';maptostring['192'] = '9f';maptostring['e1'] = 'a0';maptostring['ed'] = 'a1';maptostring['f3'] = 'a2';maptostring['fa'] = 'a3';maptostring['f1'] = 'a4';maptostring['d1'] = 'a5';maptostring['aa'] = 'a6';maptostring['ba'] = 'a7';maptostring['bf'] = 'a8';maptostring['2310'] = 'a9';maptostring['ac'] = 'aa';maptostring['bd'] = 'ab';maptostring['bc'] = 'ac';maptostring['a1'] = 'ad';maptostring['ab'] = 'ae';maptostring['bb'] = 'af';maptostring['2591'] = 'b0';maptostring['2592'] = 'b1';maptostring['2593'] = 'b2';maptostring['2502'] = 'b3';maptostring['2524'] = 'b4';maptostring['2561'] = 'b5';maptostring['2562'] = 'b6';maptostring['2556'] = 'b7';maptostring['2555'] = 'b8';maptostring['2563'] = 'b9';maptostring['2551'] = 'ba';maptostring['2557'] = 'bb';maptostring['255d'] = 'bc';maptostring['255c'] = 'bd';maptostring['255b'] = 'be';maptostring['2510'] = 'bf';maptostring['2514'] = 'c0';maptostring['2534'] = 'c1';maptostring['252c'] = 'c2';maptostring['251c'] = 'c3';maptostring['2500'] = 'c4';maptostring['253c'] = 'c5';maptostring['255e'] = 'c6';maptostring['255f'] = 'c7';maptostring['255a'] = 'c8';maptostring['2554'] = 'c9';maptostring['2569'] = 'ca';maptostring['2566'] = 'cb';maptostring['2560'] = 'cc';maptostring['2550'] = 'cd';maptostring['256c'] = 'ce';maptostring['2567'] = 'cf';maptostring['2568'] = 'd0';maptostring['2564'] = 'd1';maptostring['2565'] = 'd2';maptostring['2559'] = 'd3';maptostring['2558'] = 'd4';maptostring['2552'] = 'd5';maptostring['2553'] = 'd6';maptostring['256b'] = 'd7';maptostring['256a'] = 'd8';maptostring['2518'] = 'd9';maptostring['250c'] = 'da';maptostring['2588'] = 'db';maptostring['2584'] = 'dc';maptostring['258c'] = 'dd';maptostring['2590'] = 'de';maptostring['2580'] = 'df';maptostring['3b1'] = 'e0';maptostring['df'] = 'e1';maptostring['393'] = 'e2';maptostring['3c0'] = 'e3';maptostring['3a3'] = 'e4';maptostring['3c3'] = 'e5';maptostring['b5'] = 'e6';maptostring['3c4'] = 'e7';maptostring['3a6'] = 'e8';maptostring['398'] = 'e9';maptostring['3a9'] = 'ea';maptostring['3b4'] = 'eb';maptostring['221e'] = 'ec';maptostring['3c6'] = 'ed';maptostring['3b5'] = 'ee';maptostring['2229'] = 'ef';maptostring['2261'] = 'f0';maptostring['b1'] = 'f1';maptostring['2265'] = 'f2';maptostring['2264'] = 'f3';maptostring['2320'] = 'f4';maptostring['2321'] = 'f5';maptostring['f7'] = 'f6';maptostring['2248'] = 'f7';maptostring['b0'] = 'f8';maptostring['2219'] = 'f9';maptostring['b7'] = 'fa';maptostring['221a'] = 'fb';maptostring['207f'] = 'fc';maptostring['b2'] = 'fd';maptostring['25a0'] = 'fe';maptostring['a0'] = 'ff';
/* Convert a octet number to a code page 437 char code */
var buffer2string = function(buffer) {
	var ret = "";
	var i = 0;
	var l = buffer.length;
	var cc;
	for (; i < l; ++i) {
		cc = buffer[i];
		if (cc >= 128) {
			cc = parseInt(mapto437[cc.toString(16)], 16);
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
			cc = parseInt(maptostring[cc.toString(16)], 16);
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
			cc = parseInt(maptostring[cc.toString(16)], 16);
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
			cc = parseInt(mapto437[cc.toString(16)], 16);
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