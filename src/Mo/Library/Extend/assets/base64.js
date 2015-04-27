var map_char2num =[]; map_char2num[65] = 0;map_char2num[66] = 1;map_char2num[67] = 2;map_char2num[68] = 3;map_char2num[69] = 4;map_char2num[70] = 5;map_char2num[71] = 6;map_char2num[72] = 7;map_char2num[73] = 8;map_char2num[74] = 9;map_char2num[75] = 10;map_char2num[76] = 11;map_char2num[77] = 12;map_char2num[78] = 13;map_char2num[79] = 14;map_char2num[80] = 15;map_char2num[81] = 16;map_char2num[82] = 17;map_char2num[83] = 18;map_char2num[84] = 19;map_char2num[85] = 20;map_char2num[86] = 21;map_char2num[87] = 22;map_char2num[88] = 23;map_char2num[89] = 24;map_char2num[90] = 25;map_char2num[97] = 26;map_char2num[98] = 27;map_char2num[99] = 28;map_char2num[100] = 29;map_char2num[101] = 30;map_char2num[102] = 31;map_char2num[103] = 32;map_char2num[104] = 33;map_char2num[105] = 34;map_char2num[106] = 35;map_char2num[107] = 36;map_char2num[108] = 37;map_char2num[109] = 38;map_char2num[110] = 39;map_char2num[111] = 40;map_char2num[112] = 41;map_char2num[113] = 42;map_char2num[114] = 43;map_char2num[115] = 44;map_char2num[116] = 45;map_char2num[117] = 46;map_char2num[118] = 47;map_char2num[119] = 48;map_char2num[120] = 49;map_char2num[121] = 50;map_char2num[122] = 51;map_char2num[48] = 52;map_char2num[49] = 53;map_char2num[50] = 54;map_char2num[51] = 55;map_char2num[52] = 56;map_char2num[53] = 57;map_char2num[54] = 58;map_char2num[55] = 59;map_char2num[56] = 60;map_char2num[57] = 61;map_char2num[43] = 62;map_char2num[47] = 63;map_char2num[61] = 64;
var map_num2char = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/","="];
var encode_ = function(Str) {
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0, l = Str.length, l2 = l - l % 3;
	do {
		chr1 = Str[i++];
		chr2 = Str[i++];
		chr3 = Str[i++];
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		output += map_num2char[enc1] + map_num2char[enc2] + map_num2char[enc3] + map_num2char[enc4];
	} while (i < l2);
	if(l - l2 == 2){
		chr1 = Str[i++];
		chr2 = Str[i++];
		output += map_num2char[chr1>>2] + map_num2char[((chr1 & 3) << 4) | (chr2 >> 4)] + map_num2char[((chr2 & 15) << 2)] + "=";
	}else if(l - l2 == 1){
		chr1 = Str[i++];
		output += map_num2char[chr1>>2] + map_num2char[((chr1 & 3) << 4)] + "==";
	}
	return output;
};
var decode_ = function(Str) {
	if(Str=="") return [];
	var output = [];
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0, l = Str.length, l2 = l;
	if(Str.slice(-1)=="=") l2 = l-4;
	do {
		enc1 = map_char2num[Str.charCodeAt(i++)];
		enc2 = map_char2num[Str.charCodeAt(i++)];
		enc3 = map_char2num[Str.charCodeAt(i++)];
		enc4 = map_char2num[Str.charCodeAt(i++)];
		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
		output.push(chr1,chr2,chr3);
	} while (i < l2);
	if(l != l2){
		enc1 = map_char2num[Str.charCodeAt(i++)];
		enc2 = map_char2num[Str.charCodeAt(i++)];
		if(Str.slice(-2)=="=="){
			output.push((enc1 << 2) | (enc2 >> 4));
		}else if(Str.slice(-1)=="="){
			enc3 = map_char2num[Str.charCodeAt(i++)];
			output.push((enc1 << 2) | (enc2 >> 4),((enc2 & 15) << 4) | (enc3 >> 2));
		}
	}
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