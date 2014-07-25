<script language="jscript" runat="server">
/****************************************************
'@DESCRIPTION:	define MoLibXML object
'****************************************************/
function MoLibXML(dom){
	this.DOM=dom||null;
	this.ROOT = null;
	if(this.DOM!=null){
		this.ROOT = this.DOM.documentElement;
	}
	this.queue=[this.ROOT];
	this.selectedNode=this.ROOT;
	this.index=-1;
}

/****************************************************
'@DESCRIPTION:	create an instance of MoLibXML. You can use it in vbscript.
'@RETURN:	[Object] instance of MoLibXML
'****************************************************/
MoLibXML.New = MoLibXML.prototype.New = function(url,charset){
	return MoLibXML.Load(url,charset);	
};
MoLibXML.filter = function(node,filter,index){
	if(node==null)return null;
	if(F.string.startWith(filter,"!") && node.nodeName!=filter.substr(1)) return node;
	else if(F.string.startWith(filter,"@") && F.string.startWith(node.nodeName,filter.substr(1))) return node;
	else if(filter==":odd" && index%2==0) return node;
	else if(filter==":even" && index%2==1) return node;
	else if(node.nodeName==filter) return node;
	return null;
};
MoLibXML.Collection = function(){
	this.length=0;
	this.index=0;
	this.push = function(value){this[(this.length++)]=value;};
	this.next = function(){
		return this[this.index++];
	};
	this.reset = function(){this.index=0;};
	this.eof = function(){return this.index>=this.length;};
	this.filter = function(tag){
		var col = new MoLibXML.Collection();
		for(var i=0;i<this.length;i++){
			var node = MoLibXML.filter(this[i],tag,i);
			if(node!=null)col.push(node);
		}
		return col;
	};
};
MoLibXML.prototype.select = function(xpath,parent){
	if(this.ROOT==null)return;
	if(typeof xpath=="string"){
		if(xpath==":parent"){
			return this.select(this.selectedNode.parentNode);
		}else if(xpath==":last"){
			return this.select(this.selectedNode.lastChild);
		}else if(xpath==":first"){
			return this.select(this.selectedNode.firstChild);
		}else if(xpath==":children"){
			return this.children();
		}else if(F.string.endWith(xpath,":children")){
			this.select(xpath.substr(0,xpath.lastIndexOf(":")),parent);
			return this.children();
		}else if(F.string.endWith(xpath,":parent")){
			this.select(xpath.substr(0,xpath.lastIndexOf(":")),parent);
			return this.select(this.selectedNode.parentNode);
		}else if(F.string.endWith(xpath,":last")){
			this.select(xpath.substr(0,xpath.lastIndexOf(":")),parent);
			return this.select(this.selectedNode.lastChild);
		}else if(F.string.endWith(xpath,":first")){
			this.select(xpath.substr(0,xpath.lastIndexOf(":")),parent);
			return this.select(this.selectedNode.firstChild);
		}else{
			this.queue.push((parent||this.ROOT).selectSingleNode(xpath));
		}
	}
	else if(typeof xpath=="number") {
		this.selectedNode = this.queue[xpath];
		this.index = xpath;
		return this;
	}
	else this.queue.push(xpath);
	if(this.queue[this.queue.length-1]==null){
		this.queue.pop();
		this.index=-1;
		return this;
	}
	this.selectedNode = this.queue[this.queue.length-1];
	this.index = this.queue.length-1;
	return this;
};
MoLibXML.prototype.parent = function(){
	this.select(":parent");
	return this;
};
MoLibXML.prototype.first = function(){
	this.select(":first");
	return this;
};
MoLibXML.prototype.last = function(){
	this.select(":last");
	return this;
};
MoLibXML.prototype.children = function(filter){
	if(this.selectedNode==null)return new MoLibXML.Collection();
	var col = new MoLibXML.Collection();
	var children = this.selectedNode.childNodes;
	for(var i=0;i<children.length;i++){
		if(filter===undefined)col.push(children[i]);
		else{
			var node = MoLibXML.filter(children[i],filter,i);
			if(node!=null)col.push(node);
		}
	}
	return col;
};
MoLibXML.prototype.nodes = function(xpath,filter){
	if(this.selectedNode==null)return new MoLibXML.Collection();
	var col = new MoLibXML.Collection();
	var children = this.selectedNode.selectNodes(xpath);
	for(var i=0;i<children.length;i++){
		if(filter===undefined)col.push(children[i]);
		else{
			var node = MoLibXML.filter(children[i],filter,i);
			if(node!=null)col.push(node);
		}
	}
	return col;
};
MoLibXML.prototype.save = function(path){
	if(this.DOM==null)return this;
	this.DOM.save(path);
	return this;
};
MoLibXML.prototype.index = function(){
	return this.index;
};
MoLibXML.prototype.clear = function(){
	if(this.selectedNode==null)return this;
	while(this.selectedNode.lastChild){
		this.selectedNode.removeChild(this.selectedNode.lastChild);
	}
	return this;
};
MoLibXML.prototype.remove = function(){
	if(this.selectedNode==null)return this;
	this.selectedNode.parentNode.removeChild(this.selectedNode);
	return this;
};
MoLibXML.prototype.append = function(name,value){
	if(this.selectedNode==null)return this;
	if(typeof name=="object"){
		if(name.constructor == Object){
			for(var i in name){
				if(!name.hasOwnProperty(i))continue;
				var b = this.DOM.createElement(i);
				b.text = name[i];
				this.selectedNode.appendChild(b);
			}
		}else{
			F.each(name,function(key,dict,state){
				var b = state.DOM.createElement(key);
				b.text = dict(key);
				state.selectedNode.appendChild(b);
			},this);
		}
		return this;
	}else if(typeof value=="unknown" && value.constructor == VBArray){
		return this.append(name,(new VBArray(value)).toArray());
	}else if(typeof value=="object" && value.constructor == Array){
		for(var i=0;i<value.length;i++){
			var b = this.DOM.createElement(name);
			b.text = value[i];
			this.selectedNode.appendChild(b);
		}
		return this;
	}
	var e = this.DOM.createElement(name);
	if(value!==undefined)e.text = value;
	this.selectedNode.appendChild(e);
	this.select(e);
	return this;
};
MoLibXML.prototype.name = function(){
	if(this.selectedNode==null)return this;
	return this.selectedNode.nodeName;
};
MoLibXML.prototype.type = function(){
	if(this.selectedNode==null)return this;
	return this.selectedNode.nodeType;
};
MoLibXML.prototype.xml = function(){
	if(this.selectedNode==null)return this;
	return this.selectedNode.xml;
};
MoLibXML.prototype.text = function(value){
	if(this.selectedNode==null)return this;
	if(value!==undefined){
		this.selectedNode.text = value;
		return this;
	}
	return this.selectedNode.text;
};
MoLibXML.prototype.value = function(){
	if(this.selectedNode==null)return this;
	return this.selectedNode.nodeValue;
};
MoLibXML.prototype.comment = function(value){
	if(this.selectedNode==null)return this;
	var c = this.DOM.createComment(value);
	this.selectedNode.appendChild(c);
	return this;
};
MoLibXML.prototype.CDATA = function(value){
	if(this.selectedNode==null)return this;
	var c = this.DOM.createCDATASection(value);
	this.selectedNode.appendChild(c);return this
};
MoLibXML.prototype.attr = function(name,value){
	if(this.selectedNode==null)return this;
	if(value!==undefined){
		this.selectedNode.setAttribute(name,value);return this
	}
	var value1 = this.selectedNode.getAttribute(name);
	return (value1==null?"":value1);
};
MoLibXML.Load = function(url,charset){
	if(typeof url!="string")return new MoLibXML();
	var islocal=true;
	if(url.length>8 && url.substr(0,8).toLowerCase()=="https://")islocal=false;
	else if(url.length>7 && url.substr(0,7).toLowerCase()=="http://")islocal=false;
	var xml="";
	if(islocal){
		if(url.length>2 && url.substr(1,1)==":"){
			var stream = new ActiveXObject("ADODB.Stream");
			stream.Type = 2;
			stream.Mode = 3;
			stream.Charset = charset||"utf-8";
			stream.Open();
			stream.LoadFromFile(url);
			xml = stream.ReadText();
			stream.close();
			stream = null;
		}else{
			xml = url;
		}
	}else{
		var WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0");
		WS.open("GET",url,false);
		WS.send();
		if(WS.readyState==4) xml = F.string.frombinary(WS.responseBody,charset||"utf-8");
		WS = null;
	}
	if(xml!=""){
		var dom = new ActiveXObject("MSXML2.DomDocument");
		dom.loadXML(xml);
		return new MoLibXML(dom);
	}else{
		return new MoLibXML();
	}
};
</script>