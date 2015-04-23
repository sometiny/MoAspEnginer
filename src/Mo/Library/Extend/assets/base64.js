var base64keyStr_ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var encode_ = function(Str) {
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0, l = Str.length;
		do {
			chr1 = Str[i++];
			chr2 = Str[i++];
			chr3 = Str[i++];
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output + base64keyStr_.charAt(enc1) + base64keyStr_.charAt(enc2) + base64keyStr_.charAt(enc3) + base64keyStr_.charAt(enc4);
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < l);
		return output;
	};
var decode_ = function(Str) {
		var output = [];
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0, l = Str.length;
		do {
			enc1 = base64keyStr_.indexOf(Str.charAt(i++));
			if(enc1<0)continue;
			enc2 = base64keyStr_.indexOf(Str.charAt(i++));
			if(enc2<0)continue;
			enc3 = base64keyStr_.indexOf(Str.charAt(i++));
			if(enc3<0)continue;
			enc4 = base64keyStr_.indexOf(Str.charAt(i++));
			if(enc4<0)continue;
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output.push(chr1);
			if (enc3 != 64) {
				output.push(chr2);
			}
			if (enc4 != 64) {
				output.push(chr3);
			}
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < l);
		return output;
	};
var $node = F.activex("MSXML2.DOMDocument", function() {
	this.loadXML("<?xml version=\"1.0\" encoding=\"gb2312\"?><root xmlns:dt=\"urn:schemas-microsoft-com:datatypes\"><data dt:dt=\"bin.base64\"></data></root>");
	return this.selectSingleNode("//root/data");
}),
	$base64 = {};
$base64.e = encode_;
$base64.d = decode_;
$base64.encode = function(Str) {
	if (typeof Str == "string") Str = F.string.getByteArray(Str);
	return encode_(Str);
};
$base64.decode = function(Str) {
	return F.string.fromByteArray(decode_(Str));
};
$base64.toBinary = function(str) {
	$node.text = str;
	return $node.nodeTypedValue;
};
$base64.fromBinary = function(str) {
	$node.nodeTypedValue = str;
	return $node.text;
};
module.exports = $base64;