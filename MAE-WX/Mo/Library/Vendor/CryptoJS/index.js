var CryptoJS = CryptoJS || (function(C, x) {
	var H = {};
	H.library = "components";
	var G = H.lib = {};
	var u = G.Base = (function() {
		function a() {}
		return {
			extend: function(b) {
				a.prototype = this;
				var c = new a();
				if (b) {
					c.mixIn(b)
				}
				if (!c.hasOwnProperty("init")) {
					c.init = function() {
						c.$super.init.apply(this, arguments)
					}
				}
				c.init.prototype = c;
				c.$super = this;
				return c
			},
			create: function() {
				var b = this.extend();
				b.init.apply(b, arguments);
				return b
			},
			init: function() {},
			mixIn: function(b) {
				for (var c in b) {
					if (b.hasOwnProperty(c)) {
						this[c] = b[c]
					}
				}
				if (b.hasOwnProperty("toString")) {
					this.toString = b.toString
				}
			},
			clone: function() {
				return this.init.prototype.extend(this)
			}
		}
	}());
	var n = G.WordArray = u.extend({
		init: function(b, a) {
			b = this.words = b || [];
			if (a != x) {
				this.sigBytes = a
			} else {
				this.sigBytes = b.length * 4
			}
		},
		toString: function(a) {
			return (a || w).stringify(this)
		},
		concat: function(b) {
			var e = this.words;
			var f = b.words;
			var a = this.sigBytes;
			var c = b.sigBytes;
			this.clamp();
			if (a % 4) {
				for (var d = 0; d < c; d++) {
					var g = (f[d >>> 2] >>> (24 - (d % 4) * 8)) & 255;
					e[(a + d) >>> 2] |= g << (24 - ((a + d) % 4) * 8)
				}
			} else {
				if (f.length > 65535) {
					for (var d = 0; d < c; d += 4) {
						e[(a + d) >>> 2] = f[d >>> 2]
					}
				} else {
					e.push.apply(e, f)
				}
			}
			this.sigBytes += c;
			return this
		},
		clamp: function() {
			var b = this.words;
			var a = this.sigBytes;
			b[a >>> 2] &= 4294967295 << (32 - (a % 4) * 8);
			b.length = C.ceil(a / 4)
		},
		clone: function() {
			var a = u.clone.call(this);
			a.words = this.words.slice(0);
			return a
		},
		random: function(b) {
			var c = [];
			for (var a = 0; a < b; a += 4) {
				c.push((C.random() * 4294967296) | 0)
			}
			return new n.init(c, b)
		}
	});
	var I = H.enc = {};
	var BC = I.BitConverter = {
		ToInt32 : function(src, start){
			var value = src.slice(start,start+4);
			return (value[0]<<24) + (value[1]<<16) + (value[2]<<8) + (value[3]);
		},
		FromInt32 : function(v){
			return [v >>> 24,(v >> 16) & 0xff,(v >> 8) & 0xff,v & 0xff];
		},
		ToWordArray : function(c){
			var a = c.length;
			var b = [];
			for (var d = 0; d < a; d++) {
				b[d >>> 2] |= (c[d] & 255) << (24 - (d % 4) * 8)
			}
			return new n.init(b, a)			
		},
		FromWordArray : function(d){
			var c = d.words;
			var e = d.sigBytes;
			var a = [];
			for (var f = 0; f < e; f++) {
				var b = (c[f >>> 2] >>> (24 - (f % 4) * 8)) & 255;
				a.push(b)
			}
			return a;	
		}
	};
	var w = I.Hex = {
		stringify: function(e) {
			var c = e.words;
			var f = e.sigBytes;
			var d = [];
			for (var a = 0; a < f; a++) {
				var b = (c[a >>> 2] >>> (24 - (a % 4) * 8)) & 255;
				d.push((b >>> 4).toString(16));
				d.push((b & 15).toString(16))
			}
			return d.join("")
		},
		parse: function(c) {
			var a = c.length;
			var b = [];
			for (var d = 0; d < a; d += 2) {
				b[d >>> 3] |= parseInt(c.substr(d, 2), 16) << (24 - (d % 8) * 4)
			}
			return new n.init(b, a / 2)
		}
	};
	var D = I.Latin1 = {
		stringify: function(d) {
			var c = d.words;
			var e = d.sigBytes;
			var a = [];
			for (var f = 0; f < e; f++) {
				var b = (c[f >>> 2] >>> (24 - (f % 4) * 8)) & 255;
				a.push(String.fromCharCode(b))
			}
			return a.join("")
		},
		parse: function(c) {
			var a = c.length;
			var b = [];
			for (var d = 0; d < a; d++) {
				b[d >>> 2] |= (c.charCodeAt(d) & 255) << (24 - (d % 4) * 8)
			}
			return new n.init(b, a)
		}
	};
	var E = I.Utf8 = {
		stringify: function(a) {
			try {
				return decodeURIComponent(escape(D.stringify(a)))
			} catch (b) {
				ExceptionManager.put(b, "Utf8.stringify({wordArray})")
			}
		},
		parse: function(a) {
			return D.parse(unescape(encodeURIComponent(a)))
		}
	};
	var v = G.BufferedBlockAlgorithm = u.extend({
		reset: function() {
			this._data = new n.init();
			this._nDataBytes = 0
		},
		_append: function(a) {
			if (typeof a == "string") {
				a = E.parse(a)
			}
			this._data.concat(a);
			this._nDataBytes += a.sigBytes
		},
		_process: function(b) {
			var j = this._data;
			var a = j.words;
			var d = j.sigBytes;
			var g = this.blockSize;
			var e = g * 4;
			var f = d / e;
			if (b) {
				f = C.ceil(f)
			} else {
				f = C.max((f | 0) - this._minBufferSize, 0)
			}
			var h = f * g;
			var i = C.min(h * 4, d);
			if (h) {
				for (var k = 0; k < h; k += g) {
					this._doProcessBlock(a, k)
				}
				var c = a.splice(0, h);
				j.sigBytes -= i
			}
			return new n.init(c, i)
		},
		clone: function() {
			var a = u.clone.call(this);
			a._data = this._data.clone();
			return a
		},
		_minBufferSize: 0
	});
	var y = G.Hasher = v.extend({
		cfg: u.extend(),
		init: function(a) {
			this.cfg = this.cfg.extend(a);
			this.reset()
		},
		reset: function() {
			v.reset.call(this);
			this._doReset()
		},
		update: function(a) {
			this._append(a);
			this._process();
			return this
		},
		finalize: function(a) {
			if (a) {
				this._append(a)
			}
			var b = this._doFinalize();
			return b
		},
		blockSize: 512 / 32,
		_createHelper: function(a) {
			return function(b, c) {
				return new a.init(c).finalize(b)
			}
		},
		_createHmacHelper: function(a) {
			return function(b, c) {
				return new t.HMAC.init(a, c).finalize(b)
			}
		}
	});
	var t = H.algo = {};
	H.required = {};
	H.require = function(b, c) {
		if (typeof c == "string") {
			b = (c = [].slice.apply(arguments)).shift()
		}
		if (c && c.constructor == Array && c.length > 0) {
			for (var a = 0; a < c.length; a++) {
				H.require(c[a])
			}
		}
		if (H.required[b] === true) {
			return H.require
		}
		F.vendor.call(H, "CryptoJS/components/" + b);
		H.required[b] = true;
		return H.require
	};
	var m = {
		Hmac: ["hmac"],
		MD5: ["md5"],
		SHA1: ["sha1"],
		SHA3: ["sha3", "x64-core"],
		SHA224: ["sha224", "sha256"],
		SHA256: ["sha256"],
		SHA384: ["sha384", "x64-core", "sha512"],
		SHA512: ["sha512", "x64-core"],
		PBKDF2: ["pbkdf2", ["hmac", "sha1"]],
		EvpKDF: ["evpkdf", ["md5"]],
		RIPEMD160: ["ripemd160"],
		Base64: ["enc-base64"],
		Utf16: ["enc-utf16"],
		RC4: ["rc4", "enc-base64", "evpkdf", "cipher-core"],
		RabbitLegacy: ["rabbit-legacy", "enc-base64", "evpkdf", "cipher-core"],
		Rabbit: ["rabbit", "enc-base64", "evpkdf", "cipher-core"],
		DES: ["tripledes", "enc-base64", "evpkdf", "cipher-core"],
		AES: ["aes", "enc-base64", "evpkdf", "cipher-core"],
		Mode: ["mode", "enc-base64", "evpkdf", "cipher-core"],
		Padding: ["pad", "enc-base64", "evpkdf", "cipher-core"],
		X64: ["x64-core"],
		Format: {
			Hex: ["format-hex", "enc-base64", "evpkdf", "cipher-core"]
		}
	};
	var B = function(a) {
			return function(b) {
				return H.require.apply(b, a)
			}
		};
	for (var z in m) {
		if (!m.hasOwnProperty(z)) {
			continue
		}
		if (m[z].constructor == Array) {
			H.require[z] = B(m[z])
		} else {
			H.require[z] = {};
			for (var A in m[z]) {
				if (!m[z].hasOwnProperty(A)) {
					continue
				}
				H.require[z][A] = B(m[z][A])
			}
		}
	}
	delete B;
	delete m;
	return H
}(Math));
return exports.CryptoJS = CryptoJS;