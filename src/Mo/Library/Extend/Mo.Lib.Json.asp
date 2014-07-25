<script language="jscript" runat="server">
/*'by anlige at www.9fn.net*/
/****************************************************
'@DESCRIPTION:	define MoLibJson object(I really recommend you to use 'Mo.Lib.JsonGenerater' instead this class.).
'****************************************************/
function MoLibJson(t,df){
	this.table=[];
	this.datatype=t||"object";
	this.dateformat=df||"";
}
MoLibJson.New = function(t,df){return new MoLibJson(t,df);};
MoLibJson.prototype.put=function(key,value,tp){
	if(value===undefined)return this.putnew(key||"TMP__");
	tp = tp||"";
	tp = tp.toLowerCase();
	if(tp=="vbarray" || this.IsVBArray(value))return this.putvbarray(key,value);
	if(tp=="arraylist")return this.put(key,value.split(","));
	if(tp=="dictionary" || this.IsDictionary(value))return this.putdictionary(key,value);
	if(tp=="rows" || this.IsRecordset(value))return this.putrows(key,value);
	this.table.push({key:key,value:value});
	return this.table[this.table.length-1];
};
MoLibJson.prototype.putdictionary=function(key,value){
	return this.putnew(key).fromdictionary(value);
};
MoLibJson.prototype.fromdictionary=function(value){
	if(value.count<=0)return obj;
	var keys=(new VBArray(value.keys())).toArray();
	for(var i =0;i<keys.length;i++){
		this.put(keys[i],value.item(keys[i]));
	}
	return this;
};
MoLibJson.prototype.putnew=function(key){
	return this.put(key,new MoLibJson("object",this.dateformat))['value'];
};
MoLibJson.prototype.putnewarray=function(key){
	return this.put(key,new MoLibJson("array",this.dateformat))['value'];
};
MoLibJson.prototype.putvbarray=function(key,value){
	return this.put(key,(new VBArray(value)).toArray());
};
MoLibJson.prototype.putrows=function(key,rs,pagesize){
	return this.putnewarray(key).fromrows(rs,pagesize);
};
MoLibJson.prototype.fromrows=function(rs,pagesize){
	this.datatype="array";
	if(pagesize==undefined)pagesize=-1;
	var ps = rs.Bookmark;
	var k=0;
	while(!rs.eof && (k<pagesize || pagesize==-1)){
		k++;
		var tmp__=new Object();
		for(var i=0;i<rs.fields.count;i++){
			tmp__[rs.fields(i).Name]=rs.fields(i).value;
		}
		this.put("",tmp__);
		rs.MoveNext();
	}
	try{
		rs.Bookmark=ps;
	}catch(ex){}
	return this;
};
MoLibJson.prototype.toString = MoLibJson.prototype.getobjectstring=function(key){
	key=key||"";
	if(this.datatype=="array"){
		if(this.table.length<=0)return "[]";
		var ret="[";
		for(var i=0;i<this.table.length;i++){
			ret+=this.parse(this.table[i]["value"]) + ",";
		}
		if(ret!="[")ret=ret.substr(0,ret.length-1);
		ret+="]";
		if(key!="")return "{\"" + key + "\":" + ret + "}";
		return ret;
	}else{
		if(this.table.length<=0)return "{}";
		var ret="{";
		for(var i=0;i<this.table.length;i++){
			ret+="\""+this.table[i]["key"]+"\":" + this.parse(this.table[i]["value"]) + ",";
		}
		if(ret!="{")ret=ret.substr(0,ret.length-1);
		ret+="}";
		if(key!="")return "{\"" + key + "\":" + ret + "}";
		return ret;
	}
};
MoLibJson.prototype.del=function(key){
	if(this.table.length<=0)return;
	var tb = [],find=false;
	for(var i=0;i<this.table.length;i++){
		if(this.table[i]["key"]!=key){
			tb.push(this.table[i]);
		}else{
			find = true;
		}
	}
	if(find)this.table = tb;
};
MoLibJson.prototype.set=function(key,value){
	this.del(key);
	this.put(key,value);
};
MoLibJson.prototype.parse=function(value){
	if(value===null)return "null";
	if(this.IsVBArray(value))value=(new VBArray(value)).toArray();
	var ty = typeof(value);
	if(ty=="string"){
		return "\"" + F.jsEncode(value) + "\"";
	}else if(ty=="number" || ty=="boolean"){
		return value;	
	}else if(ty=="date"){
		var dt = new Date(value);
		if(this.dateformat==""){
			return "\""+dt.toString()+"\"";	
		}else{
			return "\""+F.formatdate(value,this.dateformat)+"\"";	
		}
	}else if(ty=="object"){
		if(value.constructor){
			if(value.constructor==Array){
				var ret1="[";
				for(var j=0;j<value.length;j++){
					ret1+=this.parse(value[j])+",";
				}
				if(ret1!="[")ret1=ret1.substr(0,ret1.length-1);
				ret1+="]";
				return ret1;
			}else if(value.constructor==MoLibJson){
				return value.getobjectstring();
			}else if(value.constructor==Object){
				var o = new MoLibJson("object",this.dateformat);
				for(var i in value){
					if(value.hasOwnProperty && value.hasOwnProperty(i)) o.put(i,value[i]);	
				}	
				return o.getobjectstring();		
			}else if(value.constructor==Date){
				var dt = new Date(value);
				if(this.dateformat==""){
					return "\""+dt.toString()+"\"";	
				}else{
					return "\""+F.formatdate(value,this.dateformat)+"\"";	
				}
			}else{
				return F.jsEncode(value.constructor.toString());	
			}
		}
	}
	return "\"unknown:" + ty +"\"";
};
MoLibJson.prototype.IsDictionary=function(o) {
    return ((o != null) &&
    (typeof(o) == "object") &&
    (o instanceof ActiveXObject) &&
    (typeof(o.Add) == "unknown") &&
    (typeof(o.Exists) == "unknown") &&
    (typeof(o.Items) == "unknown") &&
    (typeof(o.Keys) == "unknown") &&
    (typeof(o.Remove) == "unknown") &&
    (typeof(o.RemoveAll) == "unknown") &&
    (typeof(o.Count) == "number") &&
    (typeof(o.Item) == "unknown") &&
    (typeof(o.Key) == "unknown"));
};

MoLibJson.prototype.IsVBArray=function(o) {
    return ((o != null) &&
    (typeof(o) == "unknown") &&
    (o.constructor == VBArray) &&
    (typeof(o.dimensions) == "function") &&
    (typeof(o.getItem) == "function") &&
    (typeof(o.lbound) == "function") &&
    (typeof(o.toArray) == "function") &&
    (typeof(o.ubound) == "function"));
}
MoLibJson.prototype.IsRecordset=function(o) {
    return ((o != null) &&
    (typeof(o) == "object") &&
    (o instanceof ActiveXObject) &&
    (typeof(o.Fields) == "object") &&
    (typeof(o.CursorType) == "number") &&
    (typeof(o.LockType) == "number") &&
    (typeof(o.BookMark) == "number") &&
    (typeof(o.AbsolutePage) == "number" || typeof(o.AbsolutePage) == "unknown") &&
    (typeof(o.Recordcount) == "number" || typeof(o.Recordcount) == "unknown") &&
    (typeof(o.PageSize) == "number"));
}
</script>