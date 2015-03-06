var rotateLeft = function(b, a) {
		return (b << a) | (b >>> (32 - a))
	};
var addUnsigned = function(e, b) {
		var g, a, d, f, c;
		d = (e & 2147483648);
		f = (b & 2147483648);
		g = (e & 1073741824);
		a = (b & 1073741824);
		c = (e & 1073741823) + (b & 1073741823);
		if (g & a) {
			return (c ^ 2147483648 ^ d ^ f)
		}
		if (g | a) {
			if (c & 1073741824) {
				return (c ^ 3221225472 ^ d ^ f)
			} else {
				return (c ^ 1073741824 ^ d ^ f)
			}
		} else {
			return (c ^ d ^ f)
		}
	};
var F0 = function(a, c, b) {
		return (a & c) | ((~a) & b)
	};
var G = function(a, c, b) {
		return (a & b) | (c & (~b))
	};
var H = function(a, c, b) {
		return (a ^ c ^ b)
	};
var I = function(a, c, b) {
		return (c ^ (a | (~b)))
	};
var FF = function(g, f, k, j, e, h, i) {
		g = addUnsigned(g, addUnsigned(addUnsigned(F0(f, k, j), e), i));
		return addUnsigned(rotateLeft(g, h), f)
	};
var GG = function(g, f, k, j, e, h, i) {
		g = addUnsigned(g, addUnsigned(addUnsigned(G(f, k, j), e), i));
		return addUnsigned(rotateLeft(g, h), f)
	};
var HH = function(g, f, k, j, e, h, i) {
		g = addUnsigned(g, addUnsigned(addUnsigned(H(f, k, j), e), i));
		return addUnsigned(rotateLeft(g, h), f)
	};
var II = function(g, f, k, j, e, h, i) {
		g = addUnsigned(g, addUnsigned(addUnsigned(I(f, k, j), e), i));
		return addUnsigned(rotateLeft(g, h), f)
	};
var convertToWordArray = function(d) {
		var h;
		var c = d.length;
		var b = c + 8;
		var g = (b - (b % 64)) / 64;
		var f = (g + 1) * 16;
		var i = Array(f - 1);
		var a = 0;
		var e = 0;
		while (e < c) {
			h = (e - (e % 4)) / 4;
			a = (e % 4) * 8;
			i[h] = (i[h] | (d[e] << a));
			e++
		}
		h = (e - (e % 4)) / 4;
		a = (e % 4) * 8;
		i[h] = i[h] | (128 << a);
		i[f - 2] = c << 3;
		i[f - 1] = c >>> 29;
		return i
	};
var wordToHex = function(d) {
		var c = "",
			a = "",
			e, b;
		for (b = 0; b <= 3; b++) {
			e = (d >>> (b * 8)) & 255;
			a = "0" + e.toString(16);
			c = c + a.substr(a.length - 2, 2)
		}
		return c
	};
var String2Bytes = function(d) {
		d = encodeURIComponent(d);
		var a = "",
			b = 0,
			e;
		while (b < d.length) {
			e = d.substr(b, 1);
			if (e == "%") {
				a += String.fromCharCode(parseInt("0x" + d.substr(b + 1, 2)));
				b += 3
			} else {
				a += e;
				b++
			}
		}
		return a
	};
var $md5 = function(e){
	e = e + "";
	e = F.string.getByteArray(e);
	return $md5_bytes(e);
};

var $md5_bytes = function(e) {
		var m = Array();
		var w, y, f, l, v, L, K, E, B;
		var t = 7,
			r = 12,
			p = 17,
			n = 22;
		var J = 5,
			C = 9,
			A = 14,
			z = 20;
		var j = 4,
			i = 11,
			h = 16,
			g = 23;
		var u = 6,
			s = 10,
			q = 15,
			o = 21;
		m = convertToWordArray(e);
		L = 1732584193;
		K = 4023233417;
		E = 2562383102;
		B = 271733878;
		for (w = 0; w < m.length; w += 16) {
			y = L;
			f = K;
			l = E;
			v = B;
			L = FF(L, K, E, B, m[w + 0], t, 3614090360);
			B = FF(B, L, K, E, m[w + 1], r, 3905402710);
			E = FF(E, B, L, K, m[w + 2], p, 606105819);
			K = FF(K, E, B, L, m[w + 3], n, 3250441966);
			L = FF(L, K, E, B, m[w + 4], t, 4118548399);
			B = FF(B, L, K, E, m[w + 5], r, 1200080426);
			E = FF(E, B, L, K, m[w + 6], p, 2821735955);
			K = FF(K, E, B, L, m[w + 7], n, 4249261313);
			L = FF(L, K, E, B, m[w + 8], t, 1770035416);
			B = FF(B, L, K, E, m[w + 9], r, 2336552879);
			E = FF(E, B, L, K, m[w + 10], p, 4294925233);
			K = FF(K, E, B, L, m[w + 11], n, 2304563134);
			L = FF(L, K, E, B, m[w + 12], t, 1804603682);
			B = FF(B, L, K, E, m[w + 13], r, 4254626195);
			E = FF(E, B, L, K, m[w + 14], p, 2792965006);
			K = FF(K, E, B, L, m[w + 15], n, 1236535329);
			L = GG(L, K, E, B, m[w + 1], J, 4129170786);
			B = GG(B, L, K, E, m[w + 6], C, 3225465664);
			E = GG(E, B, L, K, m[w + 11], A, 643717713);
			K = GG(K, E, B, L, m[w + 0], z, 3921069994);
			L = GG(L, K, E, B, m[w + 5], J, 3593408605);
			B = GG(B, L, K, E, m[w + 10], C, 38016083);
			E = GG(E, B, L, K, m[w + 15], A, 3634488961);
			K = GG(K, E, B, L, m[w + 4], z, 3889429448);
			L = GG(L, K, E, B, m[w + 9], J, 568446438);
			B = GG(B, L, K, E, m[w + 14], C, 3275163606);
			E = GG(E, B, L, K, m[w + 3], A, 4107603335);
			K = GG(K, E, B, L, m[w + 8], z, 1163531501);
			L = GG(L, K, E, B, m[w + 13], J, 2850285829);
			B = GG(B, L, K, E, m[w + 2], C, 4243563512);
			E = GG(E, B, L, K, m[w + 7], A, 1735328473);
			K = GG(K, E, B, L, m[w + 12], z, 2368359562);
			L = HH(L, K, E, B, m[w + 5], j, 4294588738);
			B = HH(B, L, K, E, m[w + 8], i, 2272392833);
			E = HH(E, B, L, K, m[w + 11], h, 1839030562);
			K = HH(K, E, B, L, m[w + 14], g, 4259657740);
			L = HH(L, K, E, B, m[w + 1], j, 2763975236);
			B = HH(B, L, K, E, m[w + 4], i, 1272893353);
			E = HH(E, B, L, K, m[w + 7], h, 4139469664);
			K = HH(K, E, B, L, m[w + 10], g, 3200236656);
			L = HH(L, K, E, B, m[w + 13], j, 681279174);
			B = HH(B, L, K, E, m[w + 0], i, 3936430074);
			E = HH(E, B, L, K, m[w + 3], h, 3572445317);
			K = HH(K, E, B, L, m[w + 6], g, 76029189);
			L = HH(L, K, E, B, m[w + 9], j, 3654602809);
			B = HH(B, L, K, E, m[w + 12], i, 3873151461);
			E = HH(E, B, L, K, m[w + 15], h, 530742520);
			K = HH(K, E, B, L, m[w + 2], g, 3299628645);
			L = II(L, K, E, B, m[w + 0], u, 4096336452);
			B = II(B, L, K, E, m[w + 7], s, 1126891415);
			E = II(E, B, L, K, m[w + 14], q, 2878612391);
			K = II(K, E, B, L, m[w + 5], o, 4237533241);
			L = II(L, K, E, B, m[w + 12], u, 1700485571);
			B = II(B, L, K, E, m[w + 3], s, 2399980690);
			E = II(E, B, L, K, m[w + 10], q, 4293915773);
			K = II(K, E, B, L, m[w + 1], o, 2240044497);
			L = II(L, K, E, B, m[w + 8], u, 1873313359);
			B = II(B, L, K, E, m[w + 15], s, 4264355552);
			E = II(E, B, L, K, m[w + 6], q, 2734768916);
			K = II(K, E, B, L, m[w + 13], o, 1309151649);
			L = II(L, K, E, B, m[w + 4], u, 4149444226);
			B = II(B, L, K, E, m[w + 11], s, 3174756917);
			E = II(E, B, L, K, m[w + 2], q, 718787259);
			K = II(K, E, B, L, m[w + 9], o, 3951481745);
			L = addUnsigned(L, y);
			K = addUnsigned(K, f);
			E = addUnsigned(E, l);
			B = addUnsigned(B, v)
		}
		var D = wordToHex(L) + wordToHex(K) + wordToHex(E) + wordToHex(B);
		return D.toLowerCase()
	};
exports.md5_bytes = $md5_bytes;
return exports.md5 = $md5;