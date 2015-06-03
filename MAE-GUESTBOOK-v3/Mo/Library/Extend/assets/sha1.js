var map_hex2 = ["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];
var map_hex1 = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
(function() {
	var a = function(l) {
		var j = [];
		for (var m = 3; m >= 0; m--) {
			j.push((l >> (m * 8)) & 0xff);
		}
		return j;
	};
	var e = function(l) {
		var j = "";
		for (var m = 7; m >= 0; m--) {
			j += map_hex1[(l >> (m * 4)) & 0xf];
		}
		return j;
	};
	var h = function(k) {
		var m = ((k.length + 8) >> 6) + 1,
			j = new Array(m * 16);
		for (var l = 0; l < m * 16; l++) {
			j[l] = 0
		}
		for (l = 0; l < k.length; l++) {
			j[l >> 2] |= k[l] << (24 - (l & 3) * 8)
		}
		j[l >> 2] |= 128 << (24 - (l & 3) * 8);
		j[m * 16 - 1] = k.length * 8;
		return j
	};
	var i = function(m, j) {
		var k = (m & 65535) + (j & 65535);
		var l = (m >> 16) + (j >> 16) + (k >> 16);
		return (l << 16) | (k & 65535)
	};
	var d = function(k, j) {
		return (k << j) | (k >>> (32 - j))
	};
	var b = function(k, l, m, j) {
		if (k < 20) {
			return (l & m) | ((~l) & j)
		}
		if (k < 40) {
			return l ^ m ^ j
		}
		if (k < 60) {
			return (l & m) | (l & j) | (m & j)
		}
		return l ^ m ^ j
	};
	var g = function(j) {
		return (j < 20) ? 1518500249 : (j < 40) ? 1859775393 : (j < 60) ? -1894007588 : -899497514
	};
	var update = function(C, ra) {
		ra = ra===true;
		var k = h(C);
		var A = new Array(80);
		var l = 1732584193;
		var n = -271733879;
		var B = -1732584194;
		var j = 271733878;
		var m = -1009589776;
		for (var x = 0; x < k.length; x += 16) {
			var p = l;
			var r = n;
			var z = B;
			var o = j;
			var w = m;
			for (var q = 0; q < 80; q++) {
				if (q < 16) {
					A[q] = k[x + q]
				} else {
					A[q] = d(A[q - 3] ^ A[q - 8] ^ A[q - 14] ^ A[q - 16], 1)
				}
				t = i(i(d(l, 5), b(q, n, B, j)), i(i(m, A[q]), g(q)));
				m = j;
				j = B;
				B = d(n, 30);
				n = l;
				l = t
			}
			l = i(l, p);
			n = i(n, r);
			B = i(B, z);
			j = i(j, o);
			m = i(m, w)
		}
		if(ra){
			return a(l).concat(a(n)).concat(a(B)).concat(a(j)).concat(a(m));
		}else{
			return e(l) + e(n) + e(B) + e(j) + e(m);
		}
	};
	var b2hex = function(src){
		var j="";
		for(var i=0;i<src.length;i++){
			j += map_hex2[src[i]];
		}
		return j;
	};
	exports.SHA1 = function(text, ra){
		if(typeof text == "string") text = Utf8.getByteArray(text);
		return update(text, ra===true);
	};
	exports.HMACSHA1 = function(data, k, ra){
		return HMAC(update, 64, data, k, ra);
	};
})();