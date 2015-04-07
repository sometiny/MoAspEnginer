(function(av,q){var G,k,w,Q,T,ac,aB,af,K,x,m,aj,aw,j,O,M,ad,R,ap="sizzle"+-(new Date()),S=av.document,ay={},az=0,ak=0,c=I(),ao=I(),P=I(),au=typeof q,X=1<<31,ar=[],at=ar.pop,b=ar.push,v=ar.slice,h=ar.indexOf||function(aD){var aC=0,e=this.length;for(;aC<e;aC++){if(this[aC]===aD){return aC}}return -1},y="[\\x20\\t\\r\\n\\f]",a="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",U=a.replace("w","w#"),r="([*^$|!~]?=)",am="\\["+y+"*("+a+")"+y+"*(?:"+r+y+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+U+")|)|)"+y+"*\\]",t=":("+a+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+am.replace(3,8)+")*)|.*)\\)|)",A=new RegExp("^"+y+"+|((?:^|[^\\\\])(?:\\\\.)*)"+y+"+$","g"),D=new RegExp("^"+y+"*,"+y+"*"),J=new RegExp("^"+y+"*([\\x20\\t\\r\\n\\f>+~])"+y+"*"),Z=new RegExp(t),aa=new RegExp("^"+U+"$"),ai={ID:new RegExp("^#("+a+")"),CLASS:new RegExp("^\\.("+a+")"),NAME:new RegExp("^\\[name=['\"]?("+a+")['\"]?\\]"),TAG:new RegExp("^("+a.replace("w","w*")+")"),ATTR:new RegExp("^"+am),PSEUDO:new RegExp("^"+t),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+y+"*(even|odd|(([+-]|)(\\d*)n|)"+y+"*(?:([+-]|)"+y+"*(\\d+)|))"+y+"*\\)|)","i"),needsContext:new RegExp("^"+y+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+y+"*((?:-\\d)?\\d*)"+y+"*\\)|)(?=[^-]|$)","i")},ag=/[\x20\t\r\n\f]*[+~]/,W=/^[^{]+\{\s*\[native code/,Y=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,g=/^(?:input|select|textarea|button)$/i,u=/^h\d$/i,V=/'|\\/g,C=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,B=/\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,al=function(e,aC){var i="0x"+aC-65536;return i!==i?aC:i<0?String.fromCharCode(i+65536):String.fromCharCode(i>>10|55296,i&1023|56320)};try{v.call(S.documentElement.childNodes,0)[0].nodeType}catch(L){v=function(aC){var aD,e=[];while((aD=this[aC++])){e.push(aD)}return e}}function N(e){return W.test(e+"")}function I(){var e,i=[];return(e=function(aC,aD){if(i.push(aC+=" ")>w.cacheLength){delete e[i.shift()]}return(e[aC]=aD)})}function s(e){e[ap]=true;return e}function l(i){var aD=K.createElement("div");try{return i(aD)}catch(aC){return false}finally{aD=null}}function E(aJ,aC,aN,aP){var aO,aG,aH,aL,aM,aF,aE,e,aD,aK;if((aC?aC.ownerDocument||aC:S)!==K){af(aC)}aC=aC||K;aN=aN||[];if(!aJ||typeof aJ!=="string"){return aN}if((aL=aC.nodeType)!==1&&aL!==9){return[]}if(!m&&!aP){if((aO=Y.exec(aJ))){if((aH=aO[1])){if(aL===9){aG=aC.getElementById(aH);if(aG&&aG.parentNode){if(aG.id===aH){aN.push(aG);return aN}}else{return aN}}else{if(aC.ownerDocument&&(aG=aC.ownerDocument.getElementById(aH))&&O(aC,aG)&&aG.id===aH){aN.push(aG);return aN}}}else{if(aO[2]){b.apply(aN,v.call(aC.getElementsByTagName(aJ),0));return aN}else{if((aH=aO[3])&&ay.getByClassName&&aC.getElementsByClassName){b.apply(aN,v.call(aC.getElementsByClassName(aH),0));return aN}}}}if(ay.qsa&&!aj.test(aJ)){aE=true;e=ap;aD=aC;aK=aL===9&&aJ;if(aL===1&&aC.nodeName.toLowerCase()!=="object"){aF=o(aJ);if((aE=aC.getAttribute("id"))){e=aE.replace(V,"\\$&")}else{aC.setAttribute("id",e)}e="[id='"+e+"'] ";aM=aF.length;while(aM--){aF[aM]=e+p(aF[aM])}aD=ag.test(aJ)&&aC.parentNode||aC;aK=aF.join(",")}if(aK){try{b.apply(aN,v.call(aD.querySelectorAll(aK),0));return aN}catch(aI){}finally{if(!aE){aC.removeAttribute("id")}}}}}return ax(aJ.replace(A,"$1"),aC,aN,aP)}T=E.isXML=function(e){var i=e&&(e.ownerDocument||e).documentElement;return i?i.nodeName!=="HTML":false};af=E.setDocument=function(e){var i=e?e.ownerDocument||e:S;if(i===K||i.nodeType!==9||!i.documentElement){return K}K=i;x=i.documentElement;m=T(i);ay.tagNameNoComments=l(function(aC){aC.appendChild(i.createComment(""));return !aC.getElementsByTagName("*").length});ay.attributes=l(function(aD){aD.innerHTML="<select></select>";var aC=typeof aD.lastChild.getAttribute("multiple");return aC!=="boolean"&&aC!=="string"});ay.getByClassName=l(function(aC){aC.innerHTML="<div class='hidden e'></div><div class='hidden'></div>";if(!aC.getElementsByClassName||!aC.getElementsByClassName("e").length){return false}aC.lastChild.className="e";return aC.getElementsByClassName("e").length===2});ay.getByName=l(function(aD){aD.id=ap+0;aD.innerHTML="<a name='"+ap+"'></a><div name='"+ap+"'></div>";x.insertBefore(aD,x.firstChild);var aC=i.getElementsByName&&i.getElementsByName(ap).length===2+i.getElementsByName(ap+0).length;ay.getIdNotName=!i.getElementById(ap);x.removeChild(aD);return aC});ay.sortDetached=l(function(aC){return l(function(aD){return aC.compareDocumentPosition&&!!(aC.compareDocumentPosition(aD)&1)})});w.attrHandle=l(function(aC){aC.innerHTML="<a href='#'></a>";return aC.firstChild&&typeof aC.firstChild.getAttribute!==au&&aC.firstChild.getAttribute("href")==="#"})?{}:{href:function(aC){return aC.getAttribute("href",2)},type:function(aC){return aC.getAttribute("type")}};if(ay.getIdNotName){w.find.ID=function(aE,aD){if(typeof aD.getElementById!==au&&!m){var aC=aD.getElementById(aE);return aC&&aC.parentNode?[aC]:[]}};w.filter.ID=function(aD){var aC=aD.replace(B,al);return function(aE){return aE.getAttribute("id")===aC}}}else{w.find.ID=function(aE,aD){if(typeof aD.getElementById!==au&&!m){var aC=aD.getElementById(aE);return aC?aC.id===aE||typeof aC.getAttributeNode!==au&&aC.getAttributeNode("id").value===aE?[aC]:q:[]}};w.filter.ID=function(aD){var aC=aD.replace(B,al);return function(aF){var aE=typeof aF.getAttributeNode!==au&&aF.getAttributeNode("id");return aE&&aE.value===aC}}}w.find.TAG=ay.tagNameNoComments?function(aC,aD){if(typeof aD.getElementsByTagName!==au){return aD.getElementsByTagName(aC)}}:function(aC,aG){var aH,aF=[],aE=0,aD=aG.getElementsByTagName(aC);if(aC==="*"){while((aH=aD[aE++])){if(aH.nodeType===1){aF.push(aH)}}return aF}return aD};w.find.NAME=ay.getByName&&function(aC,aD){if(typeof aD.getElementsByName!==au){return aD.getElementsByName(name)}};w.find.CLASS=ay.getByClassName&&function(aD,aC){if(typeof aC.getElementsByClassName!==au&&!m){return aC.getElementsByClassName(aD)}};aw=[];aj=[":focus"];if((ay.qsa=N(i.querySelectorAll))){l(function(aC){aC.innerHTML="<select><option selected=''></option></select>";if(!aC.querySelectorAll("[selected]").length){aj.push("\\["+y+"*(?:checked|disabled|ismap|multiple|readonly|selected|value)")}if(!aC.querySelectorAll(":checked").length){aj.push(":checked")}});l(function(aC){aC.innerHTML="<input type='hidden' i=''/>";if(aC.querySelectorAll("[i^='']").length){aj.push("[*^$]="+y+"*(?:\"\"|'')")}if(!aC.querySelectorAll(":enabled").length){aj.push(":enabled",":disabled")}aC.querySelectorAll("*,:x");aj.push(",.*:")})}if((ay.matchesSelector=N((j=x.matchesSelector||x.mozMatchesSelector||x.webkitMatchesSelector||x.oMatchesSelector||x.msMatchesSelector)))){l(function(aC){ay.disconnectedMatch=j.call(aC,"div");j.call(aC,"[s!='']:x");aw.push("!=",t)})}aj=new RegExp(aj.join("|"));aw=aw.length&&new RegExp(aw.join("|"));O=N(x.contains)||x.compareDocumentPosition?function(aD,aC){var aF=aD.nodeType===9?aD.documentElement:aD,aE=aC&&aC.parentNode;return aD===aE||!!(aE&&aE.nodeType===1&&(aF.contains?aF.contains(aE):aD.compareDocumentPosition&&aD.compareDocumentPosition(aE)&16))}:function(aD,aC){if(aC){while((aC=aC.parentNode)){if(aC===aD){return true}}}return false};M=x.compareDocumentPosition?function(aD,aC){if(aD===aC){ad=true;return 0}var aE=aC.compareDocumentPosition&&aD.compareDocumentPosition&&aD.compareDocumentPosition(aC);if(aE){if(aE&1||aD.parentNode&&aD.parentNode.nodeType===11||(R&&aC.compareDocumentPosition(aD)===aE)){if(aD===i||O(S,aD)){return -1}if(aC===i||O(S,aC)){return 1}return R?(h.call(R,aD)-h.call(R,aC)):0}return aE&4?-1:1}return aD.compareDocumentPosition?-1:1}:function(aD,aC){var aJ,aG=0,aI=aD.parentNode,aF=aC.parentNode,aE=[aD],aH=[aC];if(aD===aC){ad=true;return 0}else{if(!aI||!aF){return aD===i?-1:aC===i?1:aI?-1:aF?1:0}else{if(aI===aF){return d(aD,aC)}}}aJ=aD;while((aJ=aJ.parentNode)){aE.unshift(aJ)}aJ=aC;while((aJ=aJ.parentNode)){aH.unshift(aJ)}while(aE[aG]===aH[aG]){aG++}return aG?d(aE[aG],aH[aG]):aE[aG]===S?-1:aH[aG]===S?1:0};ad=false;[0,0].sort(M);ay.detectDuplicates=ad;return K};E.matches=function(i,e){return E(i,null,null,e)};E.matchesSelector=function(aC,aE){if((aC.ownerDocument||aC)!==K){af(aC)}aE=aE.replace(C,"='$1']");if(ay.matchesSelector&&!m&&(!aw||!aw.test(aE))&&!aj.test(aE)){try{var i=j.call(aC,aE);if(i||ay.disconnectedMatch||aC.document&&aC.document.nodeType!==11){return i}}catch(aD){}}return E(aE,K,null,[aC]).length>0};E.contains=function(e,i){if((e.ownerDocument||e)!==K){af(e)}return O(e,i)};E.attr=function(i,e){var aC;if((i.ownerDocument||i)!==K){af(i)}if(!m){e=e.toLowerCase()}if((aC=w.attrHandle[e])){return aC(i)}if(m||ay.attributes){return i.getAttribute(e)}return((aC=i.getAttributeNode(e))||i.getAttribute(e))&&i[e]===true?e:aC&&aC.specified?aC.value:null};E.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)};E.uniqueSort=function(aD){var aE,aF=[],aC=1,e=0;ad=!ay.detectDuplicates;R=!ay.sortDetached&&aD.slice(0);aD.sort(M);if(ad){for(;(aE=aD[aC]);aC++){if(aE===aD[aC-1]){e=aF.push(aC)}}while(e--){aD.splice(aF[e],1)}}return aD};function d(i,e){var aD=e&&i,aC=aD&&(~e.sourceIndex||X)-(~i.sourceIndex||X);if(aC){return aC}if(aD){while((aD=aD.nextSibling)){if(aD===e){return -1}}}return i?1:-1}function F(e){return function(aC){var i=aC.nodeName.toLowerCase();return i==="input"&&aC.type===e}}function f(e){return function(aC){var i=aC.nodeName.toLowerCase();return(i==="input"||i==="button")&&aC.type===e}}function an(e){return s(function(i){i=+i;return s(function(aC,aG){var aE,aD=e([],aC.length,i),aF=aD.length;while(aF--){if(aC[(aE=aD[aF])]){aC[aE]=!(aG[aE]=aC[aE])}}})})}Q=E.getText=function(aF){var aE,aC="",aD=0,e=aF.nodeType;if(!e){for(;(aE=aF[aD]);aD++){aC+=Q(aE)}}else{if(e===1||e===9||e===11){if(typeof aF.textContent==="string"){return aF.textContent}else{for(aF=aF.firstChild;aF;aF=aF.nextSibling){aC+=Q(aF)}}}else{if(e===3||e===4){return aF.nodeValue}}}return aC};w=E.selectors={cacheLength:50,createPseudo:s,match:ai,find:{},relative:{">":{dir:"parentNode",first:true}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:true},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){e[1]=e[1].replace(B,al);e[3]=(e[4]||e[5]||"").replace(B,al);if(e[2]==="~="){e[3]=" "+e[3]+" "}return e.slice(0,4)},CHILD:function(e){e[1]=e[1].toLowerCase();if(e[1].slice(0,3)==="nth"){if(!e[3]){E.error(e[0])}e[4]=+(e[4]?e[5]+(e[6]||1):2*(e[3]==="even"||e[3]==="odd"));e[5]=+((e[7]+e[8])||e[3]==="odd")}else{if(e[3]){E.error(e[0])}}return e},PSEUDO:function(i){var e,aC=!i[5]&&i[2];if(ai.CHILD.test(i[0])){return null}if(i[4]){i[2]=i[4]}else{if(aC&&Z.test(aC)&&(e=o(aC,true))&&(e=aC.indexOf(")",aC.length-e)-aC.length)){i[0]=i[0].slice(0,e);i[2]=aC.slice(0,e)}}return i.slice(0,3)}},filter:{TAG:function(e){if(e==="*"){return function(){return true}}e=e.replace(B,al).toLowerCase();return function(i){return i.nodeName&&i.nodeName.toLowerCase()===e}},CLASS:function(e){var i=c[e+" "];return i||(i=new RegExp("(^|"+y+")"+e+"("+y+"|$)"))&&c(e,function(aC){return i.test(aC.className||(typeof aC.getAttribute!==au&&aC.getAttribute("class"))||"")})},ATTR:function(aC,i,e){return function(aE){var aD=E.attr(aE,aC);if(aD==null){return i==="!="}if(!i){return true}aD+="";return i==="="?aD===e:i==="!="?aD!==e:i==="^="?e&&aD.indexOf(e)===0:i==="*="?e&&aD.indexOf(e)>-1:i==="$="?e&&aD.slice(-e.length)===e:i==="~="?(" "+aD+" ").indexOf(e)>-1:i==="|="?aD===e||aD.slice(0,e.length+1)===e+"-":false}},CHILD:function(i,aE,aD,aF,aC){var aH=i.slice(0,3)!=="nth",e=i.slice(-4)!=="last",aG=aE==="of-type";return aF===1&&aC===0?function(aI){return !!aI.parentNode}:function(aO,aM,aR){var aI,aU,aP,aT,aQ,aL,aN=aH!==e?"nextSibling":"previousSibling",aS=aO.parentNode,aK=aG&&aO.nodeName.toLowerCase(),aJ=!aR&&!aG;if(aS){if(aH){while(aN){aP=aO;while((aP=aP[aN])){if(aG?aP.nodeName.toLowerCase()===aK:aP.nodeType===1){return false}}aL=aN=i==="only"&&!aL&&"nextSibling"}return true}aL=[e?aS.firstChild:aS.lastChild];if(e&&aJ){aU=aS[ap]||(aS[ap]={});aI=aU[i]||[];aQ=aI[0]===az&&aI[1];aT=aI[0]===az&&aI[2];aP=aQ&&aS.childNodes[aQ];while((aP=++aQ&&aP&&aP[aN]||(aT=aQ=0)||aL.pop())){if(aP.nodeType===1&&++aT&&aP===aO){aU[i]=[az,aQ,aT];break}}}else{if(aJ&&(aI=(aO[ap]||(aO[ap]={}))[i])&&aI[0]===az){aT=aI[1]}else{while((aP=++aQ&&aP&&aP[aN]||(aT=aQ=0)||aL.pop())){if((aG?aP.nodeName.toLowerCase()===aK:aP.nodeType===1)&&++aT){if(aJ){(aP[ap]||(aP[ap]={}))[i]=[az,aT]}if(aP===aO){break}}}}}aT-=aC;return aT===aF||(aT%aF===0&&aT/aF>=0)}}},PSEUDO:function(aD,aC){var e,i=w.pseudos[aD]||w.setFilters[aD.toLowerCase()]||E.error("unsupported pseudo: "+aD);if(i[ap]){return i(aC)}if(i.length>1){e=[aD,aD,"",aC];return w.setFilters.hasOwnProperty(aD.toLowerCase())?s(function(aG,aI){var aF,aE=i(aG,aC),aH=aE.length;while(aH--){aF=h.call(aG,aE[aH]);aG[aF]=!(aI[aF]=aE[aH])}}):function(aE){return i(aE,0,e)}}return i}},pseudos:{not:s(function(e){var i=[],aC=[],aD=ac(e.replace(A,"$1"));return aD[ap]?s(function(aF,aK,aI,aG){var aJ,aE=aD(aF,null,aG,[]),aH=aF.length;while(aH--){if((aJ=aE[aH])){aF[aH]=!(aK[aH]=aJ)}}}):function(aG,aF,aE){i[0]=aG;aD(i,null,aE,aC);return !aC.pop()}}),has:s(function(e){return function(i){return E(e,i).length>0}}),contains:s(function(e){return function(i){return(i.textContent||i.innerText||Q(i)).indexOf(e)>-1}}),lang:s(function(e){if(!aa.test(e||"")){E.error("unsupported lang: "+e)}e=e.replace(B,al).toLowerCase();return function(aC){var i;do{if((i=m?aC.getAttribute("xml:lang")||aC.getAttribute("lang"):aC.lang)){i=i.toLowerCase();return i===e||i.indexOf(e+"-")===0}}while((aC=aC.parentNode)&&aC.nodeType===1);return false}}),target:function(e){var i=av.location&&av.location.hash;return i&&i.slice(1)===e.id},root:function(e){return e===x},focus:function(e){return e===K.activeElement&&(!K.hasFocus||K.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:function(e){return e.disabled===false},disabled:function(e){return e.disabled===true},checked:function(e){var i=e.nodeName.toLowerCase();return(i==="input"&&!!e.checked)||(i==="option"&&!!e.selected)},selected:function(e){if(e.parentNode){e.parentNode.selectedIndex}return e.selected===true},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling){if(e.nodeName>"@"||e.nodeType===3||e.nodeType===4){return false}}return true},parent:function(e){return !w.pseudos.empty(e)},header:function(e){return u.test(e.nodeName)},input:function(e){return g.test(e.nodeName)},button:function(i){var e=i.nodeName.toLowerCase();return e==="input"&&i.type==="button"||e==="button"},text:function(i){var e;return i.nodeName.toLowerCase()==="input"&&i.type==="text"&&((e=i.getAttribute("type"))==null||e.toLowerCase()===i.type)},first:an(function(){return[0]}),last:an(function(e,i){return[i-1]}),eq:an(function(e,aC,i){return[i<0?i+aC:i]}),even:an(function(e,aD){var aC=0;for(;aC<aD;aC+=2){e.push(aC)}return e}),odd:an(function(e,aD){var aC=1;for(;aC<aD;aC+=2){e.push(aC)}return e}),lt:an(function(e,aE,aD){var aC=aD<0?aD+aE:aD;for(;--aC>=0;){e.push(aC)}return e}),gt:an(function(e,aE,aD){var aC=aD<0?aD+aE:aD;for(;++aC<aE;){e.push(aC)}return e})}};for(G in {radio:true,checkbox:true,file:true,password:true,image:true}){w.pseudos[G]=F(G)}for(G in {submit:true,reset:true}){w.pseudos[G]=f(G)}function o(aE,aJ){var i,aF,aH,aI,aG,aC,e,aD=ao[aE+" "];if(aD){return aJ?0:aD.slice(0)}aG=aE;aC=[];e=w.preFilter;while(aG){if(!i||(aF=D.exec(aG))){if(aF){aG=aG.slice(aF[0].length)||aG}aC.push(aH=[])}i=false;if((aF=J.exec(aG))){i=aF.shift();aH.push({value:i,type:aF[0].replace(A," ")});aG=aG.slice(i.length)}for(aI in w.filter){if((aF=ai[aI].exec(aG))&&(!e[aI]||(aF=e[aI](aF)))){i=aF.shift();aH.push({value:i,type:aI,matches:aF});aG=aG.slice(i.length)}}if(!i){break}}return aJ?aG.length:aG?E.error(aE):ao(aE,aC).slice(0)}function p(aE){var aD=0,aC=aE.length,e="";for(;aD<aC;aD++){e+=aE[aD].value}return e}function z(aE,aC,aD){var e=aC.dir,aF=aD&&e==="parentNode",i=ak++;return aC.first?function(aI,aH,aG){while((aI=aI[e])){if(aI.nodeType===1||aF){return aE(aI,aH,aG)}}}:function(aK,aI,aH){var aM,aG,aJ,aL=az+" "+i;if(aH){while((aK=aK[e])){if(aK.nodeType===1||aF){if(aE(aK,aI,aH)){return true}}}}else{while((aK=aK[e])){if(aK.nodeType===1||aF){aJ=aK[ap]||(aK[ap]={});if((aG=aJ[e])&&aG[0]===aL){if((aM=aG[1])===true||aM===k){return aM===true}}else{aG=aJ[e]=[aL];aG[1]=aE(aK,aI,aH)||k;if(aG[1]===true){return true}}}}}}}function aA(e){return e.length>1?function(aF,aE,aC){var aD=e.length;while(aD--){if(!e[aD](aF,aE,aC)){return false}}return true}:e[0]}function ah(e,aC,aD,aE,aH){var aF,aK=[],aG=0,aI=e.length,aJ=aC!=null;for(;aG<aI;aG++){if((aF=e[aG])){if(!aD||aD(aF,aE,aH)){aK.push(aF);if(aJ){aC.push(aG)}}}}return aK}function n(aC,i,aE,aD,aF,e){if(aD&&!aD[ap]){aD=n(aD)}if(aF&&!aF[ap]){aF=n(aF,e)}return s(function(aQ,aN,aI,aP){var aS,aO,aK,aJ=[],aR=[],aH=aN.length,aG=aQ||H(i||"*",aI.nodeType?[aI]:aI,[]),aL=aC&&(aQ||!i)?ah(aG,aJ,aC,aI,aP):aG,aM=aE?aF||(aQ?aC:aH||aD)?[]:aN:aL;if(aE){aE(aL,aM,aI,aP)}if(aD){aS=ah(aM,aR);aD(aS,[],aI,aP);aO=aS.length;while(aO--){if((aK=aS[aO])){aM[aR[aO]]=!(aL[aR[aO]]=aK)}}}if(aQ){if(aF||aC){if(aF){aS=[];aO=aM.length;while(aO--){if((aK=aM[aO])){aS.push((aL[aO]=aK))}}aF(null,(aM=[]),aS,aP)}aO=aM.length;while(aO--){if((aK=aM[aO])&&(aS=aF?h.call(aQ,aK):aJ[aO])>-1){aQ[aS]=!(aN[aS]=aK)}}}}else{aM=ah(aM===aN?aM.splice(aH,aM.length):aM);if(aF){aF(null,aN,aM,aP)}else{b.apply(aN,aM)}}})}function aq(aH){var aC,aF,aD,aG=aH.length,aK=w.relative[aH[0].type],aL=aK||w.relative[" "],aE=aK?1:0,aI=z(function(i){return i===aC},aL,true),aJ=z(function(i){return h.call(aC,i)>-1},aL,true),e=[function(aN,aM,i){return(!aK&&(i||aM!==aB))||((aC=aM).nodeType?aI(aN,aM,i):aJ(aN,aM,i))}];for(;aE<aG;aE++){if((aF=w.relative[aH[aE].type])){e=[z(aA(e),aF)]}else{aF=w.filter[aH[aE].type].apply(null,aH[aE].matches);if(aF[ap]){aD=++aE;for(;aD<aG;aD++){if(w.relative[aH[aD].type]){break}}return n(aE>1&&aA(e),aE>1&&p(aH.slice(0,aE-1)).replace(A,"$1"),aF,aE<aD&&aq(aH.slice(aE,aD)),aD<aG&&aq((aH=aH.slice(aD))),aD<aG&&p(aH))}e.push(aF)}}return aA(e)}function ae(aD,aC){var aF=0,e=aC.length>0,aE=aD.length>0,i=function(aP,aJ,aO,aN,aV){var aK,aL,aQ,aU=[],aT=0,aM="0",aG=aP&&[],aR=aV!=null,aS=aB,aI=aP||aE&&w.find.TAG("*",aV&&aJ.parentNode||aJ),aH=(az+=aS==null?1:Math.random()||0.1);if(aR){aB=aJ!==K&&aJ;k=aF}for(;(aK=aI[aM])!=null;aM++){if(aE&&aK){aL=0;while((aQ=aD[aL++])){if(aQ(aK,aJ,aO)){aN.push(aK);break}}if(aR){az=aH;k=++aF}}if(e){if((aK=!aQ&&aK)){aT--}if(aP){aG.push(aK)}}}aT+=aM;if(e&&aM!==aT){aL=0;while((aQ=aC[aL++])){aQ(aG,aU,aJ,aO)}if(aP){if(aT>0){while(aM--){if(!(aG[aM]||aU[aM])){aU[aM]=at.call(aN)}}}aU=ah(aU)}b.apply(aN,aU);if(aR&&!aP&&aU.length>0&&(aT+aC.length)>1){E.uniqueSort(aN)}}if(aR){az=aH;aB=aS}return aG};return e?s(i):i}ac=E.compile=function(e,aG){var aD,aC=[],aF=[],aE=P[e+" "];if(!aE){if(!aG){aG=o(e)}aD=aG.length;while(aD--){aE=aq(aG[aD]);if(aE[ap]){aC.push(aE)}else{aF.push(aE)}}aE=P(e,ae(aF,aC))}return aE};function H(aC,aF,aE){var aD=0,e=aF.length;for(;aD<e;aD++){E(aC,aF[aD],aE)}return aE}function ax(aD,e,aE,aH){var aF,aJ,aC,aK,aI,aG=o(aD);if(!aH){if(aG.length===1){aJ=aG[0]=aG[0].slice(0);if(aJ.length>2&&(aC=aJ[0]).type==="ID"&&e.nodeType===9&&!m&&w.relative[aJ[1].type]){e=w.find.ID(aC.matches[0].replace(B,al),e)[0];if(!e){return aE}aD=aD.slice(aJ.shift().value.length)}aF=ai.needsContext.test(aD)?0:aJ.length;while(aF--){aC=aJ[aF];if(w.relative[(aK=aC.type)]){break}if((aI=w.find[aK])){if((aH=aI(aC.matches[0].replace(B,al),ag.test(aJ[0].type)&&e.parentNode||e))){aJ.splice(aF,1);aD=aH.length&&p(aJ);if(!aD){b.apply(aE,v.call(aH,0));return aE}break}}}}}ac(aD,aG)(aH,e,m,aE,ag.test(aD));return aE}w.pseudos.nth=w.pseudos.eq;function ab(){}w.filters=ab.prototype=w.pseudos;w.setFilters=new ab();af();if(typeof define==="function"&&define.amd){define(function(){return E})}else{av.Sizzle=E}})(window);
(function(){
	Sizzle.selectors.filters.visible = function( elem ) {
		return !(elem.type=="hidden"||elem.style.display=="none"||elem.style.visibility=="hidden");
	};
	Sizzle.selectors.filters.hidden = function( elem ) {
		return !Sizzle.selectors.filters.visible(elem);
	};
	var F = window.F = function(selector,element){
		if(typeof selector =="function"){
			F.load(selector);
			return;
		}
		return new F.fn.F__(selector,element||document);
	}
	F.fn=F.prototype={
		__l__:[],
		$$guid:0,
		returnValue:null,
		F__:function(opt,SOU){
			while(this.__l__.length>0)this.__l__.pop();
			if(opt==window){
				this.__l__.push(opt);return;
			}
			if(opt.nodeType && (opt.nodeType==1 || opt.nodeType==9)){
				this.__l__.push(opt);return;
			}
			if(opt.constructor==Array){
				this.__l__=	opt;return;
			}
			this.__l__ = Sizzle(opt,SOU);
		},
		find:function(selector){
			var ary_=[];
			this.each(function(){
				var tmp=Sizzle(selector,this);
				while(tmp.length>0){
					ary_.push(tmp.pop());	
				}
			});
			return F(ary_);
		},
		filter:function(selector){
			return F(Sizzle.matches(selector,this.__l__));
		},
		html:function(value){
			var val=null;
			this.each(function(){
				if(value==undefined){
					val = this.innerHTML;
					return false;
				}else{
					this.innerHTML=value;
				}
			});
			if(val!=null)return val;
			return this;
		},
		addClass:function(cn){
			this.each(function(){
				F(this).attr("class",F.trim((F.trim(F(this).attr("class").replace(new RegExp('\\b' + cn + '\\b', 'g'), '')) + ' ' + cn)));
			 });
			return this;
		},
		removeClass:function(cn){
			this.each(function(){
				F(this).attr("class",F.trim(F(this).attr("class").replace(new RegExp('\\b' + cn + '\\b', 'g'), '')));
			});
			return this;
		},
		Class:function(value){
			var val=null;
			this.each(function(){
				if(value==undefined){
					val = F(this).attr("class");
					return false;
				}else{
					F(this).attr("class",value);
				}
			});
			if(val!=null)return val;
			return this;
		},
		css:function(){
			var val=null;
			var args=arguments;
			this.each(function(){
				var str = this.style.cssText;
				if(str.substr(str.length-1,1)==";"){str = str.substr(0,str.length-1);}
				if(args.length==0){val=this.style.cssText;return false;	}
				if(args.length==1){
					if(typeof(args[0])=="string"){
						if(args[0].indexOf(":")<=0){
							//eval("var _sss = this.style." + args[0] + ";");
							val = this.style[args[0]];
							return false;
						}else{
							this.style.cssText = args[0];
						}
					}else if(typeof(args[0])=="object"){
						var arg = args[0];
						for(var i in arg){
							if(typeof arg[i]=="object")break;
							var regexp=new RegExp("(\\;|^)"+i.replace("-","\\-")+"(\\s*)\\:(.+?)(\\;|$)","igm");
							str = str.replace(regexp,"$1");
							str += ";" + i + ":" + arg[i];
						}
						this.style.cssText = str;
					}
				}
				if(args.length==2){
					name = args[0];
					if(name === "float" || name === "cssFloat"){
						if(F.browser.ie){
							name = "styleFloat";
						}else{
							name = "cssFloat";
						}
					}
					if(name=="opacity" && F.browser.ie && F.browser.version<9){
						var opacity = parseInt(parseFloat(args[1])*100);
						this.style.filter = 'alpha(opacity="' + opacity + '")';
						if(!this.style.zoom){
							this.style.zoom = 1;
						}
						return;
					}
					this.style[name] =args[1];
				}
			});
			if(val!=null)return val;
			return this;			
		},
		val:function(value){
			var val=null;
			this.each(function(){
				if(value==undefined){
					val = this.value;
					return false;
				}else{
					this.value=value;
				}
			});
			if(val!=null)return val;
			return this;
		},
		text:function(txt){
			if(txt==undefined){
				if(this.__l__[0].length<=0)return"";
				return F.text(this.__l__[0].innerHTML) ;
			}else{
				this.each(function(){
					if(this.innerText){
						this.innerText=txt;
					}else{
						this.textContent=txt;
					}
				});
			}
			return this;			
		},
		parent:function(){
			var _ary=[];
			this.each(function(){
				if(this.parentNode)_ary.push(this.parentNode);
			 });
			return F(_ary);
		},
		tag:function(){
			return this.__l__.length>0?this.__l__[0].nodeName.toLowerCase():"";
		},
		first:function(){
			var _ary=[];
			this.each(function(){
				if(!this.firstChild)return;
				var ele = this.firstChild;
				while(ele.nodeType!=1 && ele.nextSibling){
					ele = ele.nextSibling;
				}
				if(ele.nodeType==1)_ary.push(ele);
			 });
			return F(_ary);
		},
		last:function(){
			var _ary=[];
			this.each(function(){
				if(!this.lastChild)return;
				var ele = this.lastChild;
				while(ele.nodeType!=1 && ele.previousSibling){
					ele = ele.previousSibling;
				}
				if(ele.nodeType==1)_ary.push(ele);
			 });
			return F(_ary);
		},
		remove:function(){
			this.each(function(){
				if(this.parentNode)this.parentNode.removeChild(this);
			 });
		},
		append:function(nod){
			if(typeof(nod)=="string"){
				var div = document.createElement("div");
				div.innerHTML=nod;
				this.each(function(){
					var self=this;
					F(div).child().each(function(){if(this.nodeName) self.appendChild(this);});
				});
			}else{
				this.each(function(){
					this.appendChild(nod.cloneNode(true));   
				});
			}
			return this;
		},
		hasAttr:function(name){
			return this.__l__.length>0?
			(this.__l__[0].hasAttribute ? this.__l__[0].hasAttribute(name) : (this.__l__[0].getAttribute(name)!=null)):false;
		},
		attr:function(name,value){
			if(name.toLowerCase()=="class")name = F.classstr;
			if(value===undefined){
				var ret = this.__l__.length>0?this.__l__[0].getAttribute(name):"";
				if(ret==null)return "";
				return ret;
			}else{
				this.each(function(){
					if(value!=null){
						this.setAttribute(name,value);
					}else{
						this.removeAttribute(name);
					}
				});
			}
			return this;
		},
		next:function(){
			var Ary=[];
			this.each(function(){
				var ele = this.nextSibling;
				while(ele !=null && ele.nodeType!=1){
					ele = ele.nextSibling;
				}
				if(ele)Ary.push(ele);
			});
			return F(Ary);
		},
		prev:function(){
			var Ary=[];
			this.each(function(){
				var ele = this.previousSibling;
				while(ele !=null && ele.nodeType!=1){
					ele = ele.previousSibling;
				}
				if(ele)Ary.push(ele);
			});
			return F(Ary);
		},
		child:function(){
			var Ary=[];
			this.each(function(){
				for(var i in this.childNodes){
					if(this.childNodes[i].nodeType==1)Ary.push(this.childNodes[i]);
				}
			});
			return F(Ary);
		},
		hover:function(fn1,fn2){
			this.each(function(){
				F(this).mouseover(fn1);
				F(this).mouseout(fn2);
			});
			return this;					
		},
		toggle:function(){
			this.each(function(){
				this.style.display = this.style.display!="none" ?"none":"block";	   
			});
		},
		position:function(){
			if(this.__l__ ==null || this.__l__.length<=0)return;
			var el = this.__l__[0];
			var box = el.getBoundingClientRect(), 
			doc = el.ownerDocument, 
			body = doc.body, 
			html = doc.documentElement,
			clientTop = html.clientTop || body.clientTop || 0, clientLeft = html.clientLeft || body.clientLeft || 0, 
			top = box.top + (self.pageYOffset || html.scrollTop || body.scrollTop ) - clientTop, 
			left = box.left + (self.pageXOffset || html.scrollLeft || body.scrollLeft) - clientLeft;
			return { "top": top, "left": left,"box":box };	
		},
		unbind:function(evt){
			this.each(function(){
				if(!this.events)return;
				while(this.events[evt].length>0){
					var fn = this.events[evt].pop();
					fn = null;
				}
			});
			return this;
		},
		each:function(fn,args){
			if(this.__l__ ==null || this.__l__.length<=0)return;
			this.returnValue=null;
			F.each.call(this,this.__l__,fn,args);
			return ((this.returnValue==null||this.returnValue==undefined)?this : this.returnValue);
		},length:function(){return this.__l__.length;},get:function(index){if(index<0||index>=this.__l__.length)return null;return this.__l__[index];}
	};
	F.extend=function(){
		if(arguments.length<=0)return;
		if(arguments.length==2){
			var srcObj=arguments[0];
			var newObj=arguments[1];
			if(typeof srcObj!="object")srcObj={};
			if(typeof newObj!="object")newObj={};
			for(var i in newObj)srcObj[i]=newObj[i];
			return srcObj;
		}
		var name = arguments[0];
		var args=[];
		if(typeof name=="function"){
			name.apply(this,args);	
		}else{
			var self=this;
			for(var i in name){
				if(this.__l__ && (typeof name[i]=="function")){
					this[i]=(function(fn){
						return function(){
							var ret=this.each(fn,arguments);
							return ret;
						};		  
					})(name[i]);
				}else{
					this[i]=name[i];
				}
			}
		}
	};
	F.fn.extend=function(){
		F.extend.apply(F.fn,arguments);
	};
	F.fn.F__.prototype=F.fn;
	
	F.each= function(object, callback, args){
		if(object==null || object==undefined)return;
		var name, i = 0,length = object.length,returnValue=null;
		if (args) {
			if (length == undefined) {
				for (name in object) {
					returnValue = callback.apply(object[name], args);
					if (returnValue != undefined) break;
				}
			} else {
				for (; i < length;) {
					returnValue = callback.apply(object[i++], args);
					if (returnValue != undefined) break;
				}
			}
		} else {
			if (length == undefined) {
				for (name in object) {
					returnValue=callback.call(object[name], name, object[name]);
					if (returnValue != undefined) break;
				}
			} else {
				for (var value = object[0]; i < length; value = object[++i]) {
					returnValue = callback.call(value, i, value);
					if (returnValue != undefined) break;
				}
			}
		}
		this.returnValue=returnValue;
		return object;
	};
	/*code from jquery*/
	F.fix=function(e) { 
	　　　 if (e["packaged"] == true) return e;
	　　　 var originalEvent = e;
	　　　 var event = {　originalEvent : originalEvent}; 
			for (var i in originalEvent) {
　　　　　 		event[i] = originalEvent[i]; 
			}
	　　　 event["packaged"] = true; 
	　　　 event.preventDefault = function() {
	　　　　　 if (originalEvent.preventDefault) 
	　　　　　　　originalEvent.preventDefault(); 
	　 　　　　 originalEvent.returnValue = false; 
	　　　 }; 
	　　　 event.stopPropagation = function() {
	　　　　　 if (originalEvent.stopPropagation) 
	　　　　　　　 originalEvent.stopPropagation(); 
	　　　　　 originalEvent.cancelBubble = true; 
	　　　 }; 
	　　　 event.timeStamp = event.timeStamp || (new Date()); 
	　　　 if (!event.target)
	　　　　　 event.target = event.srcElement || document;　　　　 
	　　　 if (event.target.nodeType == 3)
	　　　　　 event.target = event.target.parentNode; 
	　　　 if (!event.relatedTarget && event.fromElement)
	　　　　　 event.relatedTarget = event.fromElement == event.target 
	　　　　　　　　　? event.toElement : event.fromElement; 
	　　　 if (event.pageX == null && event.clientX != null) {
	　　　　　 var doc = document.documentElement, body = document.body; 
	　　　　 event.pageX = event.clientX 
	　　　　　　　+ (doc && doc.scrollLeft || body && body.scrollLeft || 0) 
	　　　　　　　　　- (doc.clientLeft || 0); 
	　　　　　 event.pageY = event.clientY 
	　　　　　　　+ (doc && doc.scrollTop || body && body.scrollTop || 0) 
	　　　　　　　　　- (doc.clientTop || 0); 
	　　　 }
	　 　if (!event.which　&& ((event.charCode || event.charCode === 0)
	　 　　　　　　　　　 ? event.charCode　: event.keyCode)) 
	　　　　　 {event.which = event.charCode || event.keyCode;}
	　　　 if (!event.metaKey && event.ctrlKey)
	　　　　　 event.metaKey = event.ctrlKey; 
	　　　 if (!event.which && event.button)
	　　　　　 event.which = (event.button & 1 ? 1 : (event.button & 2 
	　　　　　　　　　? 3 : (event.button & 4 ? 2 : 0))); 
	　　　 return event; 
	};
	F.events = F.fn.events = "blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,change,select,submit,keydown,keypress,keyup,error".split(",");
	F.each(F.events,function(){
		F.fn[this] = (function(evt){
			return function(fn){
				var self=this;
				this.each(function(){
					self.$$guid++;
					fn.$$guid=self.$$guid;
					if(!this.events)this.events={};
					if(!this.events[evt]){
						this.events[evt]=[];
						if((typeof this["on"+evt]=="function")){
							this.events[evt].push(this["on"+evt]);
						}
						this["on"+evt] = function(e){
							e = e || window.event;
							if(this.events[evt].length<=0)return;
							for(i=0;i<this.events[evt].length;i++){
								this.events[evt][i].apply(this,[F.fix(e)]);
							}
						}
					}
					this.events[evt].push(fn);
				});
				return this;
				
			};
		})(this);
	});
	F.load = F.fn.load = function(fn){
		var isReady=false;
		if(F.browser.ie){
			while(/loaded|complete/i.test(document.readyState)){
				fn();
				isReady = true;
			}	
			if(!isReady){
				window.attachEvent("onload",fn);	
				isReady = true;
			}
		}else{
			document.addEventListener("DOMContentLoaded",fn,false);
			isReady = true;
		}
		if(!isReady){
			window.addEventListener("load",fn,false);
		}
	};
	F.extend(function(){
		this.classstr="class";
		this.agent = this.fn.agent = window.navigator.userAgent;
		this.trim=function(val){return val.replace(/(^\s*)|(\s*$)/g,"");};
		this.browser = this.fn.browser = {ie:false,ff:false,google:false,sa:false,op:false,wk:false};
		this.browser.ie = /MSIE/i.test(this.agent);
		this.browser.ff = /firefox/i.test(this.agent);
		this.browser.google = /safari/i.test(this.agent) && /chrome/i.test(this.agent);
		this.browser.sa = /safari/i.test(this.agent) && !(/chrome/i.test(this.agent));
		this.browser.op = /Opera/i.test(this.agent);
		this.browser.wk = /webkit/i.test(this.agent);
		this.browser.version="-1";
		if(this.agent.match(/MSIE ([\d\.]+)/i)){
			this.browser.version =this.agent.match(/MSIE ([\d\.]+)/i)[1];
			if(parseInt(this.browser.version)<8)this.classstr="className";
		}
		if(F.agent.match(/Safari\/([\d\.]+)/i)){
			this.browser.version =this.agent.match(/Safari\/([\d\.]+)/)[1];
		}
		if(F.agent.match(/Chrome\/([\d\.]+)/i)){
			this.browser.version =this.agent.match(/Chrome\/([\d\.]+)/)[1];
		}
		if(F.agent.match(/Opera\/([\d\.]+)/i)){
			this.browser.version =this.agent.match(/Opera\/([\d\.]+)/)[1];
		}					  
	});
})();