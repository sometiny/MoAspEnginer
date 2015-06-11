/*
* hashtable.js
* by anlige @ 2015-6-9
*/

function HashTable(encoding){
	var hash={}, table=[],ht = function(key, value){
		if(value === undefined){
			var index = hash[key];
			if(index===undefined) return null;
			return table[index].v;
		}else{
			ht.set(key, value);
		}
	},enc = encoding || "";
	function rebuildhash(){
		hash={};
		var len_ = table.length;
		for(var i=0;i<len_;i++){
			hash[table[i].k] = i;
		}
	}
	ht.append = function(key, value){
		if(typeof key == "object"){
			for(var k in key){
				if(key.hasOwnProperty(k)) ht.append(k, key[k]);
			}
			return ht;
		}
		if(hash.hasOwnProperty(key)) {
			MEM.putWarning(0xaabe0001, 'HashTable.append', 'key \'' + key + '\' is exists.');
			return ht;
		}
		hash[key] = table.length;
		table.push({k: key, v:value});
		return ht;
	};
	ht.set = function(key, value){
		if(typeof key == "object"){
			for(var k in key){
				if(key.hasOwnProperty(k)) ht.set(k, key[k]);
			}
			return ht;
		}
		if(hash.hasOwnProperty(key)){
			table[hash[key]].v = value;
		}else{
			hash[key] = table.length;
			table.push({k: key, v:value});
		}
		return ht;
	};
	ht.has = function(key){return hash.hasOwnProperty(key);};
	ht.clear = function(){table.length=0;hash={};};
	ht.remove = function(key){
		if(arguments.length>1){
			var len_ = arguments.length;
			for(var i=0;i<len_;i++){
				ht.remove(arguments[i]);
			}
			return ht;
		}
		var index = hash[key];
		if(index!==undefined){
			delete hash[key];
			if(index==0) {
				table.shift();
				rebuildhash();
			}
			else if(index == table.length-1) table.pop();
			else{
				table.splice(index,1);
				rebuildhash();
			}
		}
		return ht;
	};
	ht.insert = function(ok, key, value){
		if(hash.hasOwnProperty(key)){
			MEM.putWarning(0xaabe0001, 'HashTable.insert', 'key \'' + key + '\' is exists.');
			return ht;
		}
		var index = hash[ok];
		if(index===undefined){
			hash[key] = table.length;
			table.push({k: key, v:value});
		}else{
			table.splice(index, 0, {k: key, v:value});
			rebuildhash();
		}
		return ht;
	};
	ht.hash = function(){return hash;};
	ht.sort = function(isasc, byvalue){
		var k = byvalue===true ? "v" : "k";
		table.sort(new Function("a", "b", "var ak = a." + k + ", bk = b." + k + ";return ak " + (isasc===false ? "<" : ">") + " bk ? 1 : (ak == bk ? 0 : -1);"));
		rebuildhash();
		return ht;
	};
	ht.reverse = function(){
		table.reverse();
		rebuildhash();
		return ht;
	}
	ht.keys = function(){
		var keys=[];
		for(var key in hash){
			if(hash.hasOwnProperty(key)) keys.push(key);
		}
		return keys;
	};
	ht.values = function(){
		var values=[], len_ = table.length;
		for(var i=0;i<len_;i++){
			values.push(table[i].v);
		}
		return values;
	};
	ht.origin = function(){return table;};
	ht.valueOf = function(){
		var ret={}, len_ = table.length, item;
		for(var i=0;i<len_;i++){
			item = table[i];
			ret[item.k] = item.v;
		}
		item = null;
		return ret;
	};
	ht.join = function(s1, s2){
		(s1===undefined) && (s1 = "&");
		(s2===undefined) && (s2 = "=");
		var ret=[], len_ = table.length, item, fn = enc ? function(s){return Encoding.encodeURIComponent(s, enc);} : function(s){return s;};
		for(var i=0;i<len_;i++){
			item = table[i];
			ret.push(item.k+ s2 + fn(item.v));
		}
		item = null;
		return ret.join(s1);
	};
	ht.parse = function(src){
		var fn = enc ? function(s){return Encoding.decodeURI(s, enc);} : function(s){return s;};
		var components = src.split("&"), len_ = components.length, item, index;
		for(var i=0;i<len_;i++){
			item =components[i];
			index = item.indexOf("=");
			if(index>0){
				ht.append(item.substr(0,index),fn(item.substr(index+1)));
			}
		}
		return ht;
	}
	ht.encoding = function(encoding){enc = encoding;return ht;};
	ht.count = function(){return table.length;};
	ht.concat = function(ht2){
		var tb = ht2.origin(), len_ = tb.length, item;
		for(var i=0;i<len_;i++){
			item = tb[i];
			ht.set(item.k, item.v);
		}
		return ht;
	};
	return ht;
}
module.exports = HashTable;