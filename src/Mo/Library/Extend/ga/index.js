/*
GoogleAuthenticator for mae
author : anlige
homepage : http://www.thinkasp.cn/
date : 2015-09-24
*/

var base32_loopup_table= [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', //  7
	'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', // 15
	'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', // 23
	'Y', 'Z', '2', '3', '4', '5', '6', '7', // 31
	'='
];
var base32_loopup_table2= {
	'A' : 0, 'B' : 1, 'C' : 2, 'D' : 3, 'E' : 4, 'F' : 5, 'G' : 6, 'H' : 7, //  7
	'I' : 8, 'J' : 9, 'K' : 10, 'L' : 11, 'M' : 12, 'N' : 13, 'O' : 14, 'P' : 15, // 15
	'Q' : 16, 'R' : 17, 'S' : 18, 'T' : 19, 'U' : 20, 'V' : 21, 'W' : 22, 'X' : 23, // 23
	'Y' : 24, 'Z' : 25, '2' : 26, '3' : 27, '4' : 28, '5' : 29, '6' : 30, '7' : 31, // 31
	'=' : 32
};
function base32_encode($secret, padding){
    if (!$secret) return '';
    padding = padding !== false;

    var len = $secret.length;
    var bin_string = "", $i, str;
    for ($i = 0; $i < len; $i++) {
	    str = $secret[$i].toString(2);
	    while(str.length<8) str = "0" + str;
        bin_string += str;
    }
    var $base32 = "";
    $i = 0;
    len = bin_string.length;
    for(var i=0;i<len;i+=5){
	    str = bin_string.substr(i,5);
	    while(str.length<5) str += "0";
	    $base32 += base32_loopup_table[parseInt(str, 2)];
    }
    var $x = bin_string.length % 40;
    if (padding && $x != 0){
        if ($x == 8) $base32 += "======";
        else if ($x == 16) $base32 += "====";
        else if ($x == 24) $base32 += "===";
        else if ($x == 32) $base32 += "=";
    }
    return $base32;
}
function base32_decode($secret){
    if (!$secret) return '';
    var pad_count=0;
    while($secret.slice(-1)=="="){
        pad_count++;
        $secret = $secret.substr(0, $secret.length-1);
    }
    if(pad_count!=6 && pad_count!=4 && pad_count!=3 && pad_count!=1 && pad_count!=0) return "";
    
    $secret = $secret.split("");
    var len = $secret.length;
    var $binaryString = [];
    for ($i = 0; $i < len; $i = $i+8) {
        var $x = "", $j ,$z, str ="", $y ;
        if (base32_loopup_table2[$secret[$i]]===undefined) return false;
        
        for ($j = 0; $j < 8; $j++) {
            str = "";
            if(base32_loopup_table2[$secret[$i + $j]]!==undefined)str = base32_loopup_table2[$secret[$i + $j]].toString(2);
            while(str.length<5) str = "0" + str;
            $x += str;
        }
        for ($z = 0; $z < $x.length; $z+=8) {
            $y = parseInt($x.substr($z, 8), 2);
            $binaryString.push($y);
        }
    }
    return $binaryString;
}
function Word2Bytes(word){
	return [word>>>24, (word >>16) & 0xff, (word >>8) & 0xff, word & 0xff];
}
function Bytes2Word(bytes){
	return (bytes[0] << 24) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
}
(function (){
	var _code_length = 6, _rnd_seeds = base32_loopup_table.slice(0,32).join("");
	function create_secret(len){
		return F.random.initialize(_rnd_seeds, len || 16);
	}
	function get_code(secret_, time_slice){
		time_slice = time_slice || Math.floor(+new Date() / 30000);
		secret_ = base32_decode(secret_);

		var time = [0,0,0,0];
		Array.prototype.push.apply(time, Word2Bytes(time_slice));
		var hm = HMACSHA1(time, secret_, true);
		var offset = hm[hm.length-1] & 0x0f;
		var hashpart = hm.slice(offset, offset + 4);
		var value = Bytes2Word(hashpart);
		value = value & 0x7FFFFFFF;
		var modulo = Math.pow(10, _code_length);
		value = (value % modulo) + "";
		while(value.length<_code_length) value = "0" + value;
		return value;
	}
	function get_qrcode_url(name, secret, title){
		//otpauth://totp/Google:xxxxx?secret=xxxxxx&issuer=Google
        var urlencoded = 'otpauth://totp/Google:' + name + '?secret=' + secret;
		if(title) urlencoded += '&issuer=' + title;
        return 'https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=' + F.encode(urlencoded);		
	}
	function verify($secret, $code, $discrepancy, $currentTimeSlice){
        if (!$currentTimeSlice) {
            $currentTimeSlice = Math.floor(+new Date() / 30000);
        }
        var $i;
        $discrepancy = $discrepancy || 1;
        for ($i = -$discrepancy; $i <= $discrepancy; $i++) {
            if (get_code($secret, $currentTimeSlice + $i) == $code ) {
                return true;
            }
        }
        return false;
	}
	module.exports = {
		create_secret : create_secret,
		get_code : get_code,
		get_qrcode_url : get_qrcode_url,
		set_code_length : function(len){ _code_length = len;},
		verify : verify
	};
})();