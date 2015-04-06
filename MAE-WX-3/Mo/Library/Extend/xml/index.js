/*
** File: xml.js
** Usage: give some methods to read or write xml document.
** About: 
**		support@mae.im
*/
function $xml(dom) {
	this.DOM = dom || null;
	this.ROOT = null;
	if (this.DOM != null) {
		this.ROOT = this.DOM.documentElement;
	}
	this.queue = [this.ROOT];
	this.selectedNode = this.ROOT;
	this.index = -1;
}
$xml.filter = function(node, filter, index) {
	if (node == null) return null;
	if (F.string.startWith(filter, "!") && node.nodeName != filter.substr(1)) return node;
	else if (F.string.startWith(filter, "@") && F.string.startWith(node.nodeName, filter.substr(1))) return node;
	else if (filter == ":odd" && index % 2 == 0) return node;
	else if (filter == ":even" && index % 2 == 1) return node;
	else if (node.nodeName == filter) return node;
	return null;
};
$xml.Collection = function() {
	this.length = 0;
	this.index = 0;
	this.push = function(value) {
		this[(this.length++)] = value;
	};
	this.next = function() {
		return this[this.index++];
	};
	this.reset = function() {
		this.index = 0;
	};
	this.eof = function() {
		return this.index >= this.length;
	};
	this.filter = function(tag) {
		var col = new $xml.Collection();
		for (var i = 0; i < this.length; i++) {
			var node = $xml.filter(this[i], tag, i);
			if (node != null) col.push(node);
		}
		return col;
	};
};
$xml.fn = $xml.prototype;
$xml.fn.select = function(xpath, parent) {
	if (this.ROOT == null) return;
	if (typeof xpath == "string") {
		if (xpath == ":parent") {
			return this.select(this.selectedNode.parentNode);
		} else if (xpath == ":last") {
			return this.select(this.selectedNode.lastChild);
		} else if (xpath == ":first") {
			return this.select(this.selectedNode.firstChild);
		} else if (xpath == ":children") {
			return this.children();
		} else if (F.string.endWith(xpath, ":children")) {
			this.select(xpath.substr(0, xpath.lastIndexOf(":")), parent);
			return this.children();
		} else if (F.string.endWith(xpath, ":parent")) {
			this.select(xpath.substr(0, xpath.lastIndexOf(":")), parent);
			return this.select(this.selectedNode.parentNode);
		} else if (F.string.endWith(xpath, ":last")) {
			this.select(xpath.substr(0, xpath.lastIndexOf(":")), parent);
			return this.select(this.selectedNode.lastChild);
		} else if (F.string.endWith(xpath, ":first")) {
			this.select(xpath.substr(0, xpath.lastIndexOf(":")), parent);
			return this.select(this.selectedNode.firstChild);
		} else {
			this.queue.push((parent || this.ROOT).selectSingleNode(xpath));
		}
	} else if (typeof xpath == "number") {
		this.selectedNode = this.queue[xpath];
		this.index = xpath;
		return this;
	} else this.queue.push(xpath);
	if (this.queue[this.queue.length - 1] == null) {
		this.queue.pop();
		this.index = -1;
		return this;
	}
	this.selectedNode = this.queue[this.queue.length - 1];
	this.index = this.queue.length - 1;
	return this;
};
$xml.fn.parent = function() {
	this.select(":parent");
	return this;
};
$xml.fn.first = function() {
	this.select(":first");
	return this;
};
$xml.fn.last = function() {
	this.select(":last");
	return this;
};
$xml.fn.children = function(filter) {
	if (this.selectedNode == null) return new $xml.Collection();
	var col = new $xml.Collection();
	var children = this.selectedNode.childNodes;
	for (var i = 0; i < children.length; i++) {
		if (filter === undefined) col.push(children[i]);
		else {
			var node = $xml.filter(children[i], filter, i);
			if (node != null) col.push(node);
		}
	}
	return col;
};
$xml.fn.nodes = function(xpath, filter) {
	if (this.selectedNode == null) return new $xml.Collection();
	var col = new $xml.Collection();
	var children = this.selectedNode.selectNodes(xpath);
	for (var i = 0; i < children.length; i++) {
		if (filter === undefined) col.push(children[i]);
		else {
			var node = $xml.filter(children[i], filter, i);
			if (node != null) col.push(node);
		}
	}
	return col;
};
$xml.fn.save = function(path) {
	if (this.DOM == null) return this;
	this.DOM.save(path);
	return this;
};
$xml.fn.root = function() {
	this.select(this.ROOT);
	return this;
};
$xml.fn.index = function() {
	return this.index;
};
$xml.fn.clear = function() {
	if (this.selectedNode == null) return this;
	while (this.selectedNode.lastChild) {
		this.selectedNode.removeChild(this.selectedNode.lastChild);
	}
	return this;
};
$xml.fn.remove = function() {
	if (this.selectedNode == null) return this;
	this.selectedNode.parentNode.removeChild(this.selectedNode);
	return this;
};
$xml.fn.append = function(name, value) {
	if (this.selectedNode == null) return this;
	if (typeof name == "object") {
		if (name.constructor == Object) {
			for (var i in name) {
				if (!name.hasOwnProperty(i)) continue;
				var b = this.DOM.createElement(i);
				b.text = name[i];
				this.selectedNode.appendChild(b);
			}
		} else {
			F.each(name, function(key, dict, state) {
				var b = state.DOM.createElement(key);
				b.text = dict(key);
				state.selectedNode.appendChild(b);
			}, this);
		}
		return this;
	} else if (typeof value == "object" && value.constructor == Array) {
		for (var i = 0; i < value.length; i++) {
			var b = this.DOM.createElement(name);
			b.text = value[i];
			this.selectedNode.appendChild(b);
		}
		return this;
	}
	var e = this.DOM.createElement(name);
	if (value !== undefined) e.text = value;
	this.selectedNode.appendChild(e);
	return e;
};
$xml.fn.appendAndSelect = function(name, value) {
	this.select(this.append(name, value));
	return this;
};
$xml.fn.name = function() {
	if (this.selectedNode == null) return this;
	return this.selectedNode.nodeName;
};
$xml.fn.type = function() {
	if (this.selectedNode == null) return this;
	return this.selectedNode.nodeType;
};
$xml.fn.xml = function() {
	if (this.selectedNode == null) return this;
	return this.selectedNode.xml;
};
$xml.fn.text = function(value) {
	if (this.selectedNode == null) return this;
	if (value !== undefined) {
		this.selectedNode.text = value;
		return this;
	}
	return this.selectedNode.text;
};
$xml.fn.value = function() {
	if (this.selectedNode == null) return this;
	return this.selectedNode.nodeValue;
};
$xml.fn.comment = function(value) {
	if (this.selectedNode == null) return this;
	var c = this.DOM.createComment(value);
	this.selectedNode.appendChild(c);
	return this;
};
$xml.fn.CDATA = function(value) {
	if (this.selectedNode == null) return this;
	var c = this.DOM.createCDATASection(value);
	this.selectedNode.appendChild(c);
	return this
};
$xml.fn.attr = function(name, value) {
	if (this.selectedNode == null) return this;
	if (value !== undefined) {
		this.selectedNode.setAttribute(name, value);
		return this
	}
	var value1 = this.selectedNode.getAttribute(name);
	return (value1 == null ? "" : value1);
};
$xml.Load = function(url, charset) {
	if (typeof url != "string") return new $xml();
	var islocal = true;
	if (url.length > 8 && url.substr(0, 8).toLowerCase() == "https://") islocal = false;
	else if (url.length > 7 && url.substr(0, 7).toLowerCase() == "http://") islocal = false;
	var xml = "";
	if (islocal) {
		if (url.length > 2 && url.substr(1, 1) == ":") {
			var stream = new ActiveXObject("ADODB.Stream");
			stream.Type = 2;
			stream.Mode = 3;
			stream.Charset = charset || "utf-8";
			stream.Open();
			stream.LoadFromFile(url);
			xml = stream.ReadText();
			stream.close();
			stream = null;
		} else {
			xml = url;
		}
	} else {
		var WS = new ActiveXObject("MSXML2.ServerXMLHTTP.3.0");
		WS.open("GET", url, false);
		WS.send();
		if (WS.readyState == 4) xml = F.string.fromBinary(WS.responseBody, charset || "utf-8");
		WS = null;
	}
	if (xml != "") {
		var dom = new ActiveXObject("MSXML2.DomDocument");
		dom.loadXML(xml);
		return new $xml(dom);
	} else {
		return new $xml();
	}
};
$xml.LoadText = function(content) {
	var dom = new ActiveXObject("MSXML2.DomDocument");
	dom.loadXML(content);
	return new $xml(dom);
}
module.exports = $xml;