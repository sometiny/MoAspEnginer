(function(){var f=exports;var b=f.lib;var g=b.StreamCipher;var d=f.algo;var c=d.RC4=g.extend({_doReset:function(){var p=this._key;var h=p.words;var k=p.sigBytes;var l=this._S=[];for(var n=0;n<256;n++){l[n]=n}for(var n=0,m=0;n<256;n++){var r=n%k;var o=(h[r>>>2]>>>(24-(r%4)*8))&255;m=(m+l[n]+o)%256;var q=l[n];l[n]=l[m];l[m]=q}this._i=this._j=0},_doProcessBlock:function(i,h){i[h]^=e.call(this)},keySize:256/32,ivSize:0});function e(){var m=this._S;var l=this._i;var h=this._j;var o=0;for(var p=0;p<4;p++){l=(l+1)%256;h=(h+m[l])%256;var k=m[l];m[l]=m[h];m[h]=k;o|=m[(m[l]+m[h])%256]<<(24-p*8)}this._i=l;this._j=h;return o}f.RC4=g._createHelper(c);var a=d.RC4Drop=c.extend({cfg:c.cfg.extend({drop:192}),_doReset:function(){c._doReset.call(this);for(var h=this.cfg.drop;h>0;h--){e.call(this)}}});f.RC4Drop=g._createHelper(a)}());