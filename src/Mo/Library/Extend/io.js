/*
** File: io.js
** Usage: some methods for io
** About: 
**		support@mae.im
*/
if(exports.io) return exports.io;
var $io = exports.io || (function(){
	var $Io = {};
	$Io.fso = F.fso || F.activex("scripting.filesystemobject");
	$Io.stream = function(mode,type){
		var stream = F.activex("adodb.stream");stream.mode = mode ||3;stream.type = type||1;return stream;
	};
	$Io.stream.writeSaveAndClose = function(stream,path,content){
		stream.write(content);
		stream.saveToFile(path,2);
		stream.close();
	};
	$Io.stream.writeTextSaveAndClose = function(stream,path,content){
		stream.writeText(content);
		stream.saveToFile(path,2);
		stream.close();
	};
	$Io.fps=[];
	
	$Io.absolute = function(path){
		path = F.mappath(path);
		return $Io.fso.GetAbsolutePathName(path);
	};
	$Io.base = function(path){
		path = F.mappath(path);
		return $Io.fso.GetBaseName (path);
	};
	return $Io;
})();
$io.file = $io.file || (function(){
	var $file = {};
	var $fn = function(fp, content){
		$file.write(fp,content);
		$file.close(fp);
	};
	$file.exists = function(path)
	{
		path = F.mappath(path);
		return $io.fso.fileexists(path);
	};
	$file.del = function(path){
		if(!$file.exists(path)) return true;
		try{
			$io.fso.deletefile(F.mappath(path));
			return true;
		}catch(ex){
			ExceptionManager.put(ex,"io.file.del");
			return false;
		}
	};
	$file.copy = function(src, dest){
		try{
			$io.fso.CopyFile(src, dest);
		}catch(ex){
			ExceptionManager.put(ex,"io.file.copy");
			return false;
		}
	};
	$file.move = function(src, dest){
		try{
			$io.fso.MoveFile(src, dest);
		}catch(ex){
			ExceptionManager.put(ex,"io.file.copy");
			return false;
		}
	};
	$file.readAllText = function(path, encoding){
		if(!$file.exists(path)) return "";
		path = F.mappath(path);
		encoding = encoding || "utf-8";
		var stream = $io.stream(3,2);
		stream.charset=encoding;
		stream.open();
		stream.loadfromfile(path);
		var returnValue = stream.readtext();
		stream.close();
		return returnValue;
	};
	$file.readAllBytes = function(path){
		if(!$file.exists(path)) return null;
		path = F.mappath(path);
		var stream = $io.stream(3,1);
		stream.open();
		stream.loadfromfile(path);
		var returnValue = stream.read();
		stream.close();
		return returnValue;
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
	$file.open = function(path,opt){
		path = F.mappath(path);
		var cfg = {
			forAppend : false,
			forText : true,
			encoding : "utf-8"
		};
		F.extend(cfg, opt);
		var fp = $io.stream(3, cfg.forText ? 2 : 1);
		if(cfg.forText) fp.charset=cfg.encoding;
		fp.open();
		if($file.exists(path) && cfg.forAppend){
			fp.loadfromfile(path);
			fp.position = fp.size;
		}
		$io.fps.push([fp,path,cfg]);
		return $io.fps.length-1;
	};
	$file.write = function(fp,content){
		if(!$io.fps[fp]){
			ExceptionManager.put("0x2d3e","io.file.write","file resource id is invalid.");
			return;
		}
		if($io.fps[fp][2].forText){
			$io.fps[fp][0].writeText(content);
		}else{
			$io.fps[fp][0].write(content);
		}
	};
	$file.close = function(fp){
		if(!$io.fps[fp]){
			ExceptionManager.put("0x2d3e","io.file.write","file resource id is invalid.");
			return;
		}
		fp = $io.fps[fp];
		fp[0].flush();
		fp[0].saveToFile(fp[1],2);
		fp[0].close();
	};
	$file.extension = function(path){return $io.fso.GetExtensionName(F.mappath(path));};
	return $file;
})();
$io.directory = $io.directory || (function(){
	var $dir = {};
	$dir.exists = function(path)
	{
		path = F.mappath(path);
		return $io.fso.folderexists(path);
	};
	$dir.del = function(path){
		if(!$dir.exists(path)) return true;
		try{
			$io.fso.deletefolder(F.mappath(path));
			return true;
		}catch(ex){
			ExceptionManager.put(ex,"io.directory.del");
			return false;
		}
	};
	$dir.copy = function(src, dest){
		try{
			$io.fso.CopyFolder(src, dest);
		}catch(ex){
			ExceptionManager.put(ex,"io.directory.copy");
			return false;
		}
	};
	$dir.move = function(src, dest){
		try{
			$io.fso.MoveFolder(src, dest);
		}catch(ex){
			ExceptionManager.put(ex,"io.directory.copy");
			return false;
		}
	};
	$dir.create = function(path){
		path = F.mappath(path);
		if($dir.exists(path))return true;
		var parent = $io.fso.GetParentFolderName(path);
		if(!$dir.exists(parent))$dir.create(parent);
		try{
			$io.fso.CreateFolder(path);
			return true;
		}catch(ex){
			ExceptionManager.put(ex,"io.directory.create");
			return false;
		}
	};
	$dir.parent = function(path){
		path = F.mappath(path);
		if(!$dir.exists(path))return "";
		return $io.fso.GetParentFolderName(path);
	};
	$dir.clear = function(path, includeSelf){
		path = F.mappath(path);
		includeSelf = includeSelf===true;
		if(!$dir.exists(path)) return false;
		try{
			var folder = $io.fso.getFolder(path);
			var files = folder.files;
			var fc = new Enumerator(files);
			for (;!fc.atEnd(); fc.moveNext()){
				if(fc.item().name!=".mae")fc.item().Delete();
			}
			files = folder.subfolders;
			fc = new Enumerator(files);
			for (;!fc.atEnd(); fc.moveNext()){
				fc.item().Delete();
			}
			if(includeSelf)folder.Delete();
			return true;	
		}catch(ex){
			ExceptionManager.put(ex,"io.directory.clear");
			return false;	
		}
	};
	$dir.files = function(path) {
		if(!$dir.exists(path)) return [];
		var files=[];
		path = F.mappath(path);
		var fc = new Enumerator($io.fso.getFolder(path).files);
		for (;!fc.atEnd(); fc.moveNext()){
			files.push(fc.item().path);
		}
		return files;
	};
	$dir.directories = function(path) {
		if(!$dir.exists(path)) return [];
		var files=[];
		path = F.mappath(path);
		var fc = new Enumerator($io.fso.getFolder(path).subfolders);
		for (;!fc.atEnd(); fc.moveNext()){
			files.push(fc.item().path);
		}
		return files;
	};
	$dir.windows = $io.fso.GetSpecialFolder(0);
	$dir.system = $io.fso.GetSpecialFolder(1);
	$dir.temp = $io.fso.GetSpecialFolder(2);
	return $dir;
})();
return exports.io = $io;