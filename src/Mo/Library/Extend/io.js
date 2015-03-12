/*
** File: io.js
** Usage: some methods for io
** About: 
**		support@mae.im
*/
if(exports.io) return exports.io;
var $io = exports.io || (function()
{
	var $Io = {};
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
			ExceptionManager.put("0x2d1e","io.get","file or directory is not exists.");
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
				ExceptionManager.put("0x2d0d","io.attr","attributes value error.");
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
		return (function(fp){var content = $io.file.read(fp);$io.file.close(fp);return content})($io.file.open(path,{forText : true, forRead : true , encoding : encoding || "utf-8"}));
	};
	$file.readAllBytes = function(path){
		return (function(fp){var content = $io.file.read(fp);$io.file.close(fp);return content})($io.file.open(path,{forText : false, forRead : true}));
	};
	$file.writeAllBytes = function(path,content){
		$fn($file.open(path, {forText : false}), content);
	};
	$file.writeAllText = function(path,content,encoding){
		$fn($file.open(path, {encoding : encoding || "utf-8"}), content);
	};
	$file.appendAllBytes = function(path,content){
		$fn($file.open(path, {forText : false, forAppend : true}), content);
	};
	$file.appendAllText = function(path,content,encoding){
		$fn($file.open(path, {encoding : encoding || "utf-8", forAppend : true}), content);
	};
	$file.open = function(path,opt)
	{
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
			ExceptionManager.put("0x2d2e","io.file.seek","file resource id is invalid.");
			return;
		}
		$io.fps[fp][0].position = position;
	};
	$file.write = function(fp,content)
	{
		if(!$io.fps[fp])
		{
			ExceptionManager.put("0x2d3e","io.file.write","file resource id is invalid.");
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
	$file.read = function(fp,length){
		if(!$io.fps[fp])
		{
			ExceptionManager.put("0x2d4e","io.file.read","file resource id is invalid.");
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
	$file.flush = function(fp)
	{
		if(!$io.fps[fp])
		{
			ExceptionManager.put("0x2d5e","io.file.flush","file resource id is invalid.");
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
			ExceptionManager.put("0x2d6e","io.file.close","file resource id is invalid.");
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
$io.directory.get = $io.file.get = $io.get;
$io.directory.attr = $io.file.attr = $io.attr;
$io.directory.base = $io.file.base = $io.base;
$io.directory.absolute = $io.file.absolute = $io.absolute;
$io.directory.parent = $io.file.parent = $io.parent;
return exports.io = $io;