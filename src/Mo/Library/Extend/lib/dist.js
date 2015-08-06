/*
 ** File: dist.js
 ** Usage: define some necessary class for MAE.
 ** Detail:
 **		IClass, use the interface to create a class quickly.
 **		IController, user this interface to create a new controller.
 ** About:
 **		support@mae.im
 */

/*IClass*/
function IClass() {}
IClass.extend = function(name, fn) {
	if (name && typeof name == "object") {
		for (var n in name) {
			if (!name.hasOwnProperty(n)) continue;
			if (typeof name[n] == "function") this.prototype[n] = name[n];
		}
		return;
	}
	if (typeof fn != "function") {
		ExceptionManager.put("0x5ca", "IClass.extend(...)", "argument 'fn' must be a function.");
		return;
	}
	this.prototype[name] = fn;
	return new IFunction(fn);
};
IClass.extend("__destruct", function() {});
IClass.create = function(__construct, __destruct) {
	var _this = this;
	var newClass = (function(fn) {
		return function() {
			_this.call(this);
			this.__STATUS__ = true;
			if (typeof fn == "function") this.__STATUS__ = fn.apply(this, arguments) !== false;
		};
	})(__construct);
	newClass.prototype = new _this();
	newClass.extend = _this.extend;
	newClass.AsPrivate = function() {
		this.__PRIVATE__ = true;
		return this;
	};
	if (typeof __destruct == "function") newClass.prototype.__destruct = __destruct;
	return newClass;
};

/*IController*/
function IFunction(fn) {
	this.fn = fn;
}
IFunction.prototype.AsPrivate = function() {
	this.fn.__PRIVATE__ = true;
};

function IController() {
	IClass.call(this);
}
IController.prototype = new IClass();
IController.extend = function(name, isPost, fn) {
	if (name && typeof name == "object") {
		for (var n in name) {
			if (!name.hasOwnProperty(n)) continue;
			IController.extend.call(this, n, name[n]);
		}
		return;
	}
	if (Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY === false) name = name.toLowerCase();
	if (isPost === true) {
		name += "_Post_";
	} else {
		fn = isPost;
	}
	IClass.extend.call(this, name, fn);
	return new IFunction(fn);
};
IController.extend("assign", function(key, value) {
	Mo.assign(key, value);
}).AsPrivate();
IController.extend("display", function() {
	Mo.display.apply(Mo, arguments);
}).AsPrivate();
IController.extend("fetch", function() {
	return Mo.fetch.apply(Mo, arguments);
}).AsPrivate();
IController.create = IClass.create;

exports.IController = IController;
exports.IClass = IClass;