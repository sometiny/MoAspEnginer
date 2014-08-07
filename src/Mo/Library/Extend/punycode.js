/*
by anlige at www.9fn.net
*/
var MoLibPunycode=
{
	TMIN : 1,
	TMAX : 26,
	BASE : 36,
	INITIAL_N : 0x80,
	INITIAL_BIAS : 72,
	DAMP : 700,
	SKEW : 38,
	DELIMITER : '-',
	INT32:2147483647,
	
	/****************************************************
	'@DESCRIPTION:	convert a unicode domain to punycode
	'@PARAM:	input [String] : unicode domain
	'@RETURN:	[String] punycode of unicode domain
	'****************************************************/
	toIDN:function(input) {
		var inputArray = input.split(".");
		var i = 0;
		var retstr = "";
		for (i = 0; i < inputArray.length;i++ ) {
			if (/^[0-9a-zA-Z\\-]+$/igm.test(inputArray[i]))
			{
				retstr += inputArray[i] + ".";
			}
			else
			{
				retstr += "xn--" + this.Encode(inputArray[i]) + ".";
			}
		}
		if (retstr != "") {
			retstr = retstr.substr(0, retstr.length - 1);
		}
		return retstr;
	},
	
	/****************************************************
	'@DESCRIPTION:	convert punycode to a unicode domain
	'@PARAM:	input [String] : punycode of unicode domain
	'@RETURN:	[String] domain
	'****************************************************/
	fromIDN:function(input)
	{
		var inputArray = input.split(".");
		var i = 0;
		var retstr = "";
		for (i = 0; i < inputArray.length; i++)
		{
			var tmp = inputArray[i];
			if (tmp.toLowerCase().indexOf("xn--")==0){
				retstr += this.Decode(tmp.substr(4)) + ".";
			}
			else {
				retstr += tmp + ".";
			}
		}
		if (retstr != "")
		{
			retstr = retstr.substr(0, retstr.length - 1);
		}
		return retstr;
	},

	/****************************************************
	'@DESCRIPTION:	Encode unicode string as punycode
	'@PARAM:	input [String] : unicode string
	'@RETURN:	[String] punycode string
	'****************************************************/
	encode:function(input)
	{
		var n = this.INITIAL_N;
		var delta = 0;
		var bias = this.INITIAL_BIAS;
		var output = "";
		var b = 0;
		input = input.split("");
		for (var i = 0; i < input.length; i++)
		{
			var c = input[i].charCodeAt(0);
			if (this.IsBasic(c))
			{
				output+=input[i];
				b++;
			}
		}

		if (b > 0)
		{
			output+=this.DELIMITER;
		}

		var h = b;
		while (h < input.length)
		{
			var m = this.INT32;

			for (var i = 0; i < input.length; i++)
			{
				var c = input[i].charCodeAt(0);
				if (c >= n && c < m)
				{
					m = c;
				}
			}

			if (m - n > (this.INT32 - delta) / (h + 1))
			{
				return"";
			}
			delta = delta + (m - n) * (h + 1);
			n = m;

			for (var j = 0; j < input.length; j++)
			{
				var c = input[j].charCodeAt(0);
				if (c < n)
				{
					delta++;
					if (0 == delta)
					{
						return "";
					}
				}
				if (c == n)
				{
					var q = delta;

					for (var k = this.BASE; ; k += this.BASE)
					{
						var t;
						if (k <= bias)
						{
							t = this.TMIN;
						}
						else if (k >= bias + this.TMAX)
						{
							t = this.TMAX;
						}
						else
						{
							t = k - bias;
						}
						if (q < t)
						{
							break;
						}
						t = Math.ceil(t);
						output+=String.fromCharCode(this.Digit2Codepoint(t + (q - t) % (this.BASE - t)));
						q = (q - t) / (this.BASE - t);
						q= Math.floor(q);
						
					}

					output+=String.fromCharCode(this.Digit2Codepoint(q));
					bias = this.Adapt(delta, h + 1, h == b);
					delta = 0;
					h++;
				}
			}

			delta++;
			n++;
		}

		return output;
	},
	/****************************************************
	'@DESCRIPTION:	Decode punycode as unicode string
	'@PARAM:	input [String] : punycode string
	'@RETURN:	[String] unicode string
	'****************************************************/
	decode:function(input)
	{
		var n = this.INITIAL_N;
		var i = 0;
		var bias = this.INITIAL_BIAS;
		var output = "";

		var d = input.lastIndexOf(this.DELIMITER);
		input = input.split("");
		if (d > 0)
		{
			for (var j = 0; j < d; j++)
			{
				var c = input[j].charCodeAt(0);
				if (!this.IsBasic(c))
				{
					return "";
				}
				output+=input[j];
			}
			d++;
		}
		else
		{
			d = 0;
		}

		while (d < input.length)
		{
			var oldi = i;
			var w = 1;

			for (var k = this.BASE; ; k += this.BASE)
			{
				if (d == input.length)
				{
					return "";
				}
				var c = input[d++].charCodeAt(0);
				var digit = this.Codepoint2Digit(c);
				if (digit > (this.INT32 - i) / w)
				{
					return "";
				}

				i = i + digit * w;

				var t;
				if (k <= bias)
				{
					t = this.TMIN;
				}
				else if (k >= bias + this.TMAX)
				{
					t = this.TMAX;
				}
				else
				{
					t = k - bias;
				}
				t = Math.ceil(t);
				if (digit < t)
				{
					break;
				}
				w = w * (this.BASE - t);
			}

			bias = this.Adapt(i - oldi, output.length + 1, oldi == 0);

			if (i / (output.length + 1) > this.INT32 - n)
			{
				return "";
			}
			n = n + i / (output.length + 1);
			n=Math.floor(n);
			i = i % (output.length + 1);
			var chr = String.fromCharCode(n);
			if(i==0){
				output = chr + output;
			}else{
				output = output.substr(0,i) + chr + output.substr(i);
			}
			i++;
		}
		return output;
	},
	Adapt:function(delta, numpoints,first)
	{
		if (first)
		{
			delta = delta / this.DAMP;
		}
		else
		{
			delta = delta / 2;
		}

		delta = delta + (delta / numpoints);

		var k = 0;
		while (delta > ((this.BASE - this.TMIN) * this.TMAX) / 2)
		{
			delta = delta / (this.BASE - this.TMIN);
			k = k + this.BASE;
		}

		return k + ((this.BASE - this.TMIN + 1) * delta) / (delta + this.SKEW);
	},
	IsBasic:function(c)
	{
		return c < 0x80;
	},

	Digit2Codepoint:function(d)
	{
		if (d < 26)
		{
			return d + "a".charCodeAt(0);
		}
		else if (d < 36)
		{
			return d - 26 + "0".charCodeAt(0);
		}
		else
		{
			return 0;
		}

	},
	Codepoint2Digit:function (c)
	{
		if (c -"0".charCodeAt(0) < 10)
		{
			return c -"0".charCodeAt(0) + 26;
		}
		else if (c -"a".charCodeAt(0) < 26)
		{
			return c - "a".charCodeAt(0);
		}
		else
		{
			return 0;
		}
	}
}
return exports.punycode = MoLibPunycode;