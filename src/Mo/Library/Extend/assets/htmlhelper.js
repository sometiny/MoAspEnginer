/*
html helper
*/
var parseattrs = function(attrs){
	attrs = attrs || {};
	var ret = "";
	for(var i in attrs){
		if(!attrs.hasOwnProperty(i)) continue;
		ret += F.format(" {0}=\"{1}\"", i, attrs[i]);
	}
	return ret;
}
var helper = {};
helper.ActionLink = function(title, url, attrs){
	return F.format("<a href=\"{0}\"{1}>{2}</a>", Mo.U(url), parseattrs(attrs), title);
};
helper.Form = function(name, action, method, attrs){
	return F.format("<form name=\"{2}\" action=\"{0}\"{1} method=\"{3}\">", Mo.U(action), parseattrs(attrs), name, method || "GET");
};
helper.FormUpload = function(name, action, attrs){
	return F.format("<form name=\"{2}\" action=\"{0}\"{1} method=\"POST\" enctype=\"multipart/form-data\">", Mo.U(action), parseattrs(attrs), name);
};
helper.FormEnd = function(){
	return "</form>";
};
helper.Input = function(type, name, value, attrs){
	var input = "<input type=\"" + type + "\"";
	if(name) input += " name=\"" + name + "\"";
	if(value) input += " value=\"" + value + "\"";
	input += parseattrs(attrs);
	return input + " />";
};
helper.CheckBox = function(name, value,attrs){
	return helper.Input("checkbox", name, value, attrs);
};
helper.DropDownList = function(name, list, selectedIndex, attrs){
	selectedIndex = selectedIndex || 0;
	var select = "<select name=\"" + name + "\"" + parseattrs(attrs) + ">";
	var index=0;
	if(list.length !== undefined){
		for(var i =0;i<list.length;i++){
			select += F.format("<option value=\"{0}\"{2}>{1}</option>", list[i], list[i], selectedIndex==list[i] ? " selected=\"selected\"":"");
		}
	}else{
		for(var i in list){
			if(!list.hasOwnProperty(i)) continue;
			select += F.format("<option value=\"{0}\"{2}>{1}</option>", i, list[i], selectedIndex==index ? " selected=\"selected\"":"");
			index++;
		}
	}
	return select + "</select>";
};
helper.ListBox = function(name, list, selectedIndex, attrs){
	attrs = attrs || {};
	attrs["multiple"] = "multiple";
	return helper.DropDownList(name, list, selectedIndex, attrs);
};
helper.Hidden = function(name, value){
	return helper.Input("hidden", name, value);
};
helper.Password = function(name, value, attrs){
	return helper.Input("password", name, value, attrs);
};
helper.RadioButton = function(name, value, attrs){
	return helper.Input("radio", name, value, attrs);
};
helper.TextArea = function(name, value, attrs){
	return F.format("<textarea name=\"{0}\"{2}>{1}</textarea>", name, value, parseattrs(attrs));
};
helper.TextBox = function(name, value, attrs){
	return helper.Input("text", name, value, attrs);
};
helper.Button = function(name, value, attrs){
	return helper.Input("button", name, value, attrs);
};
helper.ResetButton = function(name, value, attrs){
	return helper.Input("reset", name, value, attrs);
};
helper.SubmitButton = function(name, value, attrs){
	return helper.Input("submit", name, value, attrs);
};
module.exports = helper;