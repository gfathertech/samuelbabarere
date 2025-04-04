import{g as ie}from"./index-D7prB_cM.js";function re(z,Y){for(var I=0;I<Y.length;I++){const v=Y[I];if(typeof v!="string"&&!Array.isArray(v)){for(const c in v)if(c!=="default"&&!(c in z)){const s=Object.getOwnPropertyDescriptor(v,c);s&&Object.defineProperty(z,c,s.get?s:{enumerable:!0,get:()=>v[c]})}}}return Object.freeze(Object.defineProperty(z,Symbol.toStringTag,{value:"Module"}))}var te={exports:{}};(function(z,Y){(function(I,v){z.exports=v()})(window,function(){return function(I){var v={};function c(s){if(v[s])return v[s].exports;var l=v[s]={i:s,l:!1,exports:{}};return I[s].call(l.exports,l,l.exports,c),l.l=!0,l.exports}return c.m=I,c.c=v,c.d=function(s,l,m){c.o(s,l)||Object.defineProperty(s,l,{enumerable:!0,get:m})},c.r=function(s){typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(s,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(s,"__esModule",{value:!0})},c.t=function(s,l){if(1&l&&(s=c(s)),8&l||4&l&&typeof s=="object"&&s&&s.__esModule)return s;var m=Object.create(null);if(c.r(m),Object.defineProperty(m,"default",{enumerable:!0,value:s}),2&l&&typeof s!="string")for(var k in s)c.d(m,k,(function(b){return s[b]}).bind(null,k));return m},c.n=function(s){var l=s&&s.__esModule?function(){return s.default}:function(){return s};return c.d(l,"a",l),l},c.o=function(s,l){return Object.prototype.hasOwnProperty.call(s,l)},c.p="/",c(c.s=1)}([function(I,v){var c;c=function(){return this}();try{c=c||new Function("return this")()}catch{typeof window=="object"&&(c=window)}I.exports=c},function(I,v,c){c(2),I.exports=c(6)},function(I,v,c){(function(s,l){var m,k;function b(O){return(b=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(P){return typeof P}:function(P){return P&&typeof Symbol=="function"&&P.constructor===Symbol&&P!==Symbol.prototype?"symbol":typeof P})(O)}(function(O,P){b(v)=="object"&&I!==void 0?P():(k=typeof(m=P)=="function"?m.call(v,c,v,I):m)===void 0||(I.exports=k)})(0,function(){function O(r){var a=this.constructor;return this.then(function(f){return a.resolve(r()).then(function(){return f})},function(f){return a.resolve(r()).then(function(){return a.reject(f)})})}function P(){}function w(r){if(!(this instanceof w))throw new TypeError("Promises must be constructed via new");if(typeof r!="function")throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],S(r,this)}function x(r,a){for(;r._state===3;)r=r._value;r._state!==0?(r._handled=!0,w._immediateFn(function(){var f=r._state===1?a.onFulfilled:a.onRejected;if(f!==null){var h;try{h=f(r._value)}catch(_){return void C(a.promise,_)}W(a.promise,h)}else(r._state===1?W:C)(a.promise,r._value)})):r._deferreds.push(a)}function W(r,a){try{if(a===r)throw new TypeError("A promise cannot be resolved with itself.");if(a&&(b(a)=="object"||typeof a=="function")){var f=a.then;if(a instanceof w)return r._state=3,r._value=a,void L(r);if(typeof f=="function")return void S(function(h,_){return function(){h.apply(_,arguments)}}(f,a),r)}r._state=1,r._value=a,L(r)}catch(h){C(r,h)}}function C(r,a){r._state=2,r._value=a,L(r)}function L(r){r._state===2&&r._deferreds.length===0&&w._immediateFn(function(){r._handled||w._unhandledRejectionFn(r._value)});for(var a=0,f=r._deferreds.length;f>a;a++)x(r,r._deferreds[a]);r._deferreds=null}function S(r,a){var f=!1;try{r(function(h){f||(f=!0,W(a,h))},function(h){f||(f=!0,C(a,h))})}catch(h){if(f)return;f=!0,C(a,h)}}var T=setTimeout;w.prototype.catch=function(r){return this.then(null,r)},w.prototype.then=function(r,a){var f=new this.constructor(P);return x(this,new function(h,_,R){this.onFulfilled=typeof h=="function"?h:null,this.onRejected=typeof _=="function"?_:null,this.promise=R}(r,a,f)),f},w.prototype.finally=O,w.all=function(r){return new w(function(a,f){function h(J,j){try{if(j&&(b(j)=="object"||typeof j=="function")){var V=j.then;if(typeof V=="function")return void V.call(j,function(B){h(J,B)},f)}_[J]=j,--R==0&&a(_)}catch(B){f(B)}}if(!r||r.length===void 0)throw new TypeError("Promise.all accepts an array");var _=Array.prototype.slice.call(r);if(_.length===0)return a([]);for(var R=_.length,D=0;_.length>D;D++)h(D,_[D])})},w.resolve=function(r){return r&&b(r)=="object"&&r.constructor===w?r:new w(function(a){a(r)})},w.reject=function(r){return new w(function(a,f){f(r)})},w.race=function(r){return new w(function(a,f){for(var h=0,_=r.length;_>h;h++)r[h].then(a,f)})},w._immediateFn=typeof s=="function"&&function(r){s(r)}||function(r){T(r,0)},w._unhandledRejectionFn=function(r){console!==void 0&&console&&console.warn("Possible Unhandled Promise Rejection:",r)};var A=function(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(l!==void 0)return l;throw Error("unable to locate global object")}();"Promise"in A?A.Promise.prototype.finally||(A.Promise.prototype.finally=O):A.Promise=w})}).call(this,c(3).setImmediate,c(0))},function(I,v,c){(function(s){var l=s!==void 0&&s||typeof self<"u"&&self||window,m=Function.prototype.apply;function k(b,O){this._id=b,this._clearFn=O}v.setTimeout=function(){return new k(m.call(setTimeout,l,arguments),clearTimeout)},v.setInterval=function(){return new k(m.call(setInterval,l,arguments),clearInterval)},v.clearTimeout=v.clearInterval=function(b){b&&b.close()},k.prototype.unref=k.prototype.ref=function(){},k.prototype.close=function(){this._clearFn.call(l,this._id)},v.enroll=function(b,O){clearTimeout(b._idleTimeoutId),b._idleTimeout=O},v.unenroll=function(b){clearTimeout(b._idleTimeoutId),b._idleTimeout=-1},v._unrefActive=v.active=function(b){clearTimeout(b._idleTimeoutId);var O=b._idleTimeout;O>=0&&(b._idleTimeoutId=setTimeout(function(){b._onTimeout&&b._onTimeout()},O))},c(4),v.setImmediate=typeof self<"u"&&self.setImmediate||s!==void 0&&s.setImmediate||this&&this.setImmediate,v.clearImmediate=typeof self<"u"&&self.clearImmediate||s!==void 0&&s.clearImmediate||this&&this.clearImmediate}).call(this,c(0))},function(I,v,c){(function(s,l){(function(m,k){if(!m.setImmediate){var b,O,P,w,x,W=1,C={},L=!1,S=m.document,T=Object.getPrototypeOf&&Object.getPrototypeOf(m);T=T&&T.setTimeout?T:m,{}.toString.call(m.process)==="[object process]"?b=function(a){l.nextTick(function(){r(a)})}:function(){if(m.postMessage&&!m.importScripts){var a=!0,f=m.onmessage;return m.onmessage=function(){a=!1},m.postMessage("","*"),m.onmessage=f,a}}()?(w="setImmediate$"+Math.random()+"$",x=function(a){a.source===m&&typeof a.data=="string"&&a.data.indexOf(w)===0&&r(+a.data.slice(w.length))},m.addEventListener?m.addEventListener("message",x,!1):m.attachEvent("onmessage",x),b=function(a){m.postMessage(w+a,"*")}):m.MessageChannel?((P=new MessageChannel).port1.onmessage=function(a){r(a.data)},b=function(a){P.port2.postMessage(a)}):S&&"onreadystatechange"in S.createElement("script")?(O=S.documentElement,b=function(a){var f=S.createElement("script");f.onreadystatechange=function(){r(a),f.onreadystatechange=null,O.removeChild(f),f=null},O.appendChild(f)}):b=function(a){setTimeout(r,0,a)},T.setImmediate=function(a){typeof a!="function"&&(a=new Function(""+a));for(var f=new Array(arguments.length-1),h=0;h<f.length;h++)f[h]=arguments[h+1];var _={callback:a,args:f};return C[W]=_,b(W),W++},T.clearImmediate=A}function A(a){delete C[a]}function r(a){if(L)setTimeout(r,0,a);else{var f=C[a];if(f){L=!0;try{(function(h){var _=h.callback,R=h.args;switch(R.length){case 0:_();break;case 1:_(R[0]);break;case 2:_(R[0],R[1]);break;case 3:_(R[0],R[1],R[2]);break;default:_.apply(void 0,R)}})(f)}finally{A(a),L=!1}}}}})(typeof self>"u"?s===void 0?this:s:self)}).call(this,c(0),c(5))},function(I,v){var c,s,l=I.exports={};function m(){throw new Error("setTimeout has not been defined")}function k(){throw new Error("clearTimeout has not been defined")}function b(T){if(c===setTimeout)return setTimeout(T,0);if((c===m||!c)&&setTimeout)return c=setTimeout,setTimeout(T,0);try{return c(T,0)}catch{try{return c.call(null,T,0)}catch{return c.call(this,T,0)}}}(function(){try{c=typeof setTimeout=="function"?setTimeout:m}catch{c=m}try{s=typeof clearTimeout=="function"?clearTimeout:k}catch{s=k}})();var O,P=[],w=!1,x=-1;function W(){w&&O&&(w=!1,O.length?P=O.concat(P):x=-1,P.length&&C())}function C(){if(!w){var T=b(W);w=!0;for(var A=P.length;A;){for(O=P,P=[];++x<A;)O&&O[x].run();x=-1,A=P.length}O=null,w=!1,function(r){if(s===clearTimeout)return clearTimeout(r);if((s===k||!s)&&clearTimeout)return s=clearTimeout,clearTimeout(r);try{s(r)}catch{try{return s.call(null,r)}catch{return s.call(this,r)}}}(T)}}function L(T,A){this.fun=T,this.array=A}function S(){}l.nextTick=function(T){var A=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)A[r-1]=arguments[r];P.push(new L(T,A)),P.length!==1||w||b(C)},L.prototype.run=function(){this.fun.apply(null,this.array)},l.title="browser",l.browser=!0,l.env={},l.argv=[],l.version="",l.versions={},l.on=S,l.addListener=S,l.once=S,l.off=S,l.removeListener=S,l.removeAllListeners=S,l.emit=S,l.prependListener=S,l.prependOnceListener=S,l.listeners=function(T){return[]},l.binding=function(T){throw new Error("process.binding is not supported")},l.cwd=function(){return"/"},l.chdir=function(T){throw new Error("process.chdir is not supported")},l.umask=function(){return 0}},function(I,v,c){c.r(v),c.d(v,"getInstance",function(){return $}),c.d(v,"setInstanceForWebComponent",function(){return Q});var s={ASM:"asm",WASM:"ems",JS_WORKER:"jsworker",THREADED_WASM:"wasm-threads"};function l(e,n){if(typeof e!="string"||!n)return e;var o=n.substr(0,n.lastIndexOf("/"));return/^(\/|%2F|[a-z0-9-]+:)/i.test(e)?e:"".concat(o,"/").concat(e)}function m(e){return(m=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n})(e)}function k(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function b(e,n){for(var o=0;o<n.length;o++){var t=n[o];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(e,(u=t.key,i=void 0,i=function(p,d){if(m(p)!=="object"||p===null)return p;var y=p[Symbol.toPrimitive];if(y!==void 0){var g=y.call(p,d);if(m(g)!=="object")return g;throw new TypeError("@@toPrimitive must return a primitive value.")}return(d==="string"?String:Number)(p)}(u,"string"),m(i)==="symbol"?i:String(i)),t)}var u,i}function O(e,n){if(n&&(m(n)==="object"||typeof n=="function"))return n;if(n!==void 0)throw new TypeError("Derived constructors may only return object or undefined");return function(o){if(o===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return o}(e)}function P(e){var n=typeof Map=="function"?new Map:void 0;return(P=function(o){if(o===null||(t=o,Function.toString.call(t).indexOf("[native code]")===-1))return o;var t;if(typeof o!="function")throw new TypeError("Super expression must either be null or a function");if(n!==void 0){if(n.has(o))return n.get(o);n.set(o,u)}function u(){return w(o,arguments,C(this).constructor)}return u.prototype=Object.create(o.prototype,{constructor:{value:u,enumerable:!1,writable:!0,configurable:!0}}),W(u,o)})(e)}function w(e,n,o){return(w=x()?Reflect.construct.bind():function(t,u,i){var p=[null];p.push.apply(p,u);var d=new(Function.bind.apply(t,p));return i&&W(d,i.prototype),d}).apply(null,arguments)}function x(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}function W(e,n){return(W=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(o,t){return o.__proto__=t,o})(e,n)}function C(e){return(C=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(n){return n.__proto__||Object.getPrototypeOf(n)})(e)}var L=0,S=function(e){(function(d,y){if(typeof y!="function"&&y!==null)throw new TypeError("Super expression must either be null or a function");d.prototype=Object.create(y&&y.prototype,{constructor:{value:d,writable:!0,configurable:!0}}),Object.defineProperty(d,"prototype",{writable:!1}),y&&W(d,y)})(p,e);var n,o,t,u,i=(n=p,o=x(),function(){var d,y=C(n);if(o){var g=C(this).constructor;d=Reflect.construct(y,arguments,g)}else d=y.apply(this,arguments);return O(this,d)});function p(){return k(this,p),i.apply(this,arguments)}return t=p,(u=[{key:"connectedCallback",value:function(){if(!this.shadowRoot){var d=this.attachShadow({mode:"open"}),y=this.getAttribute("path");window.isApryseWebViewerWebComponent=!0,window.webViewerPath=y,this.id=this.getAttribute("id")||function g(){var M=localStorage.getItem("wv_instanceIds");if((M=M?M.split(","):[]).length&&M[L]){var E=M[L];return L++,E}var U=Math.random().toString(36).slice(-6);return M.findIndex(function(H){return H===U})===-1?(M.push(U),localStorage.setItem("wv_instanceIds",M),L++,U):g()}()||"default",fetch("".concat(y,"/ui/index-wc.html")).then(function(g){return g.text()}).then(function(g){d.innerHTML=g,function M(E,U){if(function(N){return N.tagName==="SCRIPT"}(E)===!0)E.parentNode.replaceChild(function(N,oe){var q=document.createElement("script");q.text=N.innerHTML;for(var Z=-1,ee=N.attributes;++Z<ee.length;){var X=ee[Z];X.name==="src"?q.setAttribute("src","".concat(oe).concat(X.value)):q.setAttribute(X.name,X.value)}return q.async=!1,q}(E,U),E);else for(var H=-1,K=E.childNodes;++H<K.length;)M(K[H],U);return E}(d,y),window.dispatchEvent(new Event("webviewerloaded"))})}}}])&&b(t.prototype,u),Object.defineProperty(t,"prototype",{writable:!1}),p}(P(HTMLElement));try{customElements.define("apryse-webviewer",S)}catch(e){console.warn("This environment does not allow for usage of the WebComponent version of WebViewer: ".concat(e))}var T=function(e,n){return new Promise(function(o,t){var u,i,p,d=document.createElement("apryse-webviewer");d.setAttribute("id","wc-".concat(n.id)),e.l=e.l||e.licenseKey,e.azureWorkaround=e.azureWorkaround||e.enableAzureWorkaround,e.annotationAdmin=e.annotationAdmin||e.isAdminUser,e.enableReadOnlyMode=e.enableReadOnlyMode||e.isReadOnly,e.showLocalFilePicker=e.showLocalFilePicker||e.enableFilePicker,e.useSharedWorker=e.workerTransportPromise?"true":"false",e.path=e.path||"/lib",e.css&&(u=n,i=e.css,(p=document.createElement("link")).setAttribute("rel","stylesheet"),p.setAttribute("href","".concat(i)),u.appendChild(p)),e.workerTransportPromise&&(window.apryseWorkerTransportPromise=e.workerTransportPromise),e.l&&(window.apryse_l=btoa(e.l));var y=["disableLogs","highContrastMode"];for(var g in["autoCreate","autoFocusNoteOnAnnotationSelection","enableOptimizedWorkers","enableAnnotations","preloadPDFWorker","useDownloader"].forEach(function(E){(e==null?void 0:e[E])===void 0&&(e[E]=!0)}),e)(e==null?void 0:e[g])!==void 0&&(e==null?void 0:e[g])!==null&&(y.includes(g)&&e[g]===!1?d.removeAttribute(g):g==="encryption"?d.setAttribute("auto_load",!1):g!=="licenseKey"&&g!=="l"&&d.setAttribute(g,e[g]));d.setAttribute("webviewerjsversion","11.3.0");var M=function(E){E.data==="requestl"&&E.source&&E.source.postMessage({type:"responsel",value:e.l||e.licenseKey},"*")};n.appendChild(d),d.addEventListener("ready",function(){if(e.config){var E=document.createElement("script");E.src=e.config,document.body.appendChild(E)}if(e.encryption){var U=e.initialDoc,H={decrypt:d.instance.Core.Encryption.decrypt,decryptOptions:e.encryption,documentId:e.documentId,extension:"xod"};d.instance.UI.loadDocument(U,H)}if(e.additionalTranslations){var K=e.additionalTranslations;d.instance.UI.setTranslations(K.language,K.translations)}Q(n,d.instance),d.instance.UI.dispose=function(){return new Promise(function(N){window.removeEventListener("message",M),console.clear(),d.instance.Core.documentViewer.closeDocument().then(function(){N()})})},o(d.instance)}),window.addEventListener("message",M,!1)})};function A(e){return(A=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n})(e)}function r(e,n){var o=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter(function(u){return Object.getOwnPropertyDescriptor(e,u).enumerable})),o.push.apply(o,t)}return o}function a(e){for(var n=1;n<arguments.length;n++){var o=arguments[n]!=null?arguments[n]:{};n%2?r(Object(o),!0).forEach(function(t){f(e,t,o[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(o)):r(Object(o)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(o,t))})}return e}function f(e,n,o){return(n=function(t){var u=function(i,p){if(A(i)!=="object"||i===null)return i;var d=i[Symbol.toPrimitive];if(d!==void 0){var y=d.call(i,p);if(A(y)!=="object")return y;throw new TypeError("@@toPrimitive must return a primitive value.")}return(p==="string"?String:Number)(i)}(t,"string");return A(u)==="symbol"?u:String(u)}(n))in e?Object.defineProperty(e,n,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[n]=o,e}window.WebViewerWebComponent=T;var h={},_=0;typeof console>"u"&&(window.console={log:function(){},warn:function(){},error:function(){}});var R=function(){for(var e=1;e<arguments.length;e++)for(var n=Object.keys(arguments[e]),o=0;o<n.length;o++)arguments[0][n[o]]=arguments[e][n[o]];return arguments[0]},D=function(e){var n=[];return e.forEach(function(o){n.push(o)}),n},J=function(e,n){var o;try{o=new CustomEvent(e,{detail:n,bubbles:!0,cancelable:!0})}catch{(o=document.createEvent("Event")).initEvent(e,!0,!0),o.detail=n}return o};window.PDFNet&&!h.skipPDFNetWebViewerWarning&&console.warn("PDFNet.js and WebViewer.js have been included in the same context. See https://community.apryse.com/t/what-is-the-best-location-to-call-pdfnet-apis-when-used-in-conjunction-with-webviewer/5210 for an explanation of why this could be an error in your application.");var j=new Map,V=new Map;h.WebViewer=function(e,n){var o=this;if(V.get(n))throw new Error("Two instances of WebViewer were created on the same HTML element. Please create a new element for each instance of WebViewer");V.set(n,!0),n.addEventListener("ready",function p(){j.get(n).instance=o.getCompleteInstance(),n.removeEventListener("ready",p)}),this._validateOptions(e);var t=e.webviewerServerURL||e.pdftronServer;e.fullAPI&&t&&(e.forceClientSideInit||console.warn("The fullAPI and webviewerServerURL options have both been set so the forceClientSideInit option is now enabled. This means that WebViewer will switch to client side rendering and processing to allow use of the full API."),e.forceClientSideInit=!0),this.options=R({},h.WebViewer.Options,e);var u=this.options.path.length-1;u>0&&this.options.path[u]!=="/"&&(this.options.path+="/"),this.options.uiPath=this.options.path+this.options.uiPath,n||console.error("ViewerElement is not defined. This may be caused by calling the WebViewer constructor before the DOM is loaded, or an invalid selector. Please see https://docs.apryse.com/documentation/web/get-started/ for an example."),this.element=n,this.element.style.overflow="hidden";var i=this;this.messageHandler=function(p){if(p.data==="requestl"&&p.source&&p.source.postMessage({type:"responsel",value:e.l||e.licenseKey},"*"),p.data.type==="requestConfig"&&p.data.id===i.id&&p.source){var d=e.config?i._correctRelativePath(e.config):"";p.source.postMessage({type:"responseConfig",value:d},"*")}},window.addEventListener("message",this.messageHandler,!1),this.options.autoCreate&&this.create()};var B={licenseKey:void 0,enableAzureWorkaround:!1,isAdminUser:!1,isReadOnly:!1};h.WebViewer.prototype={version:"11.3.0",create:function(){if(this.options.initialDoc){var e=this._correctRelativePath(this.options.initialDoc);e=encodeURIComponent(JSON.stringify(e)),this.options.initialDoc=e}this._create()},_create:function(){this.id=++_,this._trigger===void 0&&(this._trigger=function(n,o){var t=J(n,o);this.element.dispatchEvent(t)});var e=this.options.type.replace(" ","").split(",");e.length<1&&(e[0]="html5"),this._createViewer(e)},_validateOptions:function(e){for(var n=Object.keys(e),o=0;o<n.length;o++){var t=n[o];t in R({},B,h.WebViewer.Options)||console.warn("".concat(t," is not a valid option name. See https://docs.apryse.com/api/web/global.html#WebViewerOptions for all available options."))}var u=e.webviewerServerURL||e.pdftronServer;!e.enableRedaction||e.fullAPI||u||console.warn("FullAPI or WebViewer Server is needed to apply redactions")},_notSupportedMobile:function(){var e=document.createElement("div");e.id="webviewer-browser-unsupported",e.textContent="PDF document viewing is not supported by this browser.",this.element.appendChild(e)},_createViewer:function(e){var n,o=this;if(o.selectedType=null,this.isMobileDevice()){if(this.options.documentType&&this.options.documentType!=="xod"&&!this._testWebAssembly())return void this._notSupportedMobile();if(e=Array("html5Mobile"),o.selectedType="html5Mobile",this.options.mobileRedirect)return n=this.options.uiPath+this._getHTML5OptionsURL(),void(window.location=n)}for(var t=!1,u=!1,i=0;i<e.length;i++){if(e[i].toLowerCase()==="html5mobile"){if(this.options.documentType&&this.options.documentType!=="xod"&&!this._testWebAssembly())continue;if(t=!0,o._testHTML5()){if(this.options.mobileRedirect)return o.selectedType="html5Mobile",n=this.options.uiPath+this._getHTML5OptionsURL(),void(window.location=n);if(this.options.xdomainProxyUrl||o.isSameOrigin(decodeURIComponent(o.options.initialDoc))||o._testCORS()){o.selectedType="html5Mobile";break}u=!0}}if(e[i].toLowerCase()==="html5"&&(t=!0,o._testHTML5())){var p=o.isSameOrigin(decodeURIComponent(o.options.initialDoc));if(this.options.xdomainProxyUrl||p||o._testCORS()){o.selectedType="html5";break}u=!0}}if(o.selectedType==="html5")o._createHTML5();else if(o.selectedType==="html5Mobile")o._createHTML5Mobile();else{var d;if(u?d="This browser does not support cross origin requests. Please configure xdomain to support CORS.":t&&(d="Please use an HTML5 compatible browser."),d){var y=document.createElement("div");y.id="webviewer-browser-unsupported",y.textContent=d,o.element.appendChild(y)}}},_viewerLoaded:function(e){this._trigger("ready");try{var n=e.contentWindow;if(n.postMessage({type:"viewerLoaded"},"*"),this.options.encryption!==void 0){var o=decodeURIComponent(this.options.initialDoc);this.options.initialDoc&&(o=JSON.parse(o));var t={decrypt:n.Core.Encryption.decrypt,decryptOptions:this.options.encryption,documentId:this.options.documentId,extension:"xod"};this.getInstance().UI.loadDocument(o,t)}}catch{console.warn("Viewer is on a different domain, the promise from WebViewer function is rejected and API functions will not work because of cross domain permissions. See https://docs.apryse.com/documentation/web/guides/wv-inside/#loading-webviewer-from-another-domain for more information.")}},_getHTML5OptionsURL:function(){var e,n,o,t=this.options,u=t.webviewerServerURL||t.pdftronServer,i="";if(t.initialDoc&&(i+="#d=".concat(t.initialDoc)),t.backendType===void 0&&(t.backendType=t.pdfBackend),t.documentType&&t.documentType==="xod"&&(e=t.documentType),t.preloadWorker&&t.preloadWorker==="xod"&&(e=t.preloadWorker),t.extension&&(e=t.extension),e&&(i+="&extension=".concat(e)),t.documentType&&t.documentType!=="xod"&&(n=t.documentType),t.preloadWorker&&t.preloadWorker!=="xod"&&(n=t.preloadWorker),n&&(i+="&preloadWorker=".concat(n)),t.backendType&&(i+="&pdf=".concat(t.backendType,"&office=").concat(t.backendType,"&legacyOffice=").concat(t.backendType)),t.filename&&(i+="&filename=".concat(t.filename)),t.streaming!==void 0&&(i+="&streaming=".concat(t.streaming)),t.externalPath){var p=this._correctRelativePath(t.externalPath);p=encodeURIComponent(p),i+="&p=".concat(p)}if(t.encryption&&(i+="&auto_load=false"),t.enableAnnotations&&(i+="&a=1"),t.disabledElements){var d=encodeURIComponent(t.disabledElements.join(","));i+="&disabledElements=".concat(d)}if(t.serverUrl){var y=this._correctRelativePath(t.serverUrl);y=encodeURIComponent(y),i+="&server_url=".concat(y)}if(t.serverUrlHeaders&&(i+="&serverUrlHeaders=".concat(JSON.stringify(t.serverUrlHeaders))),t.documentId&&(i+="&did=".concat(t.documentId)),t.css){var g=this._correctRelativePath(t.css);g=encodeURIComponent(g),i+="&css=".concat(g)}return t.disableI18n&&(i+="&disableI18n=1"),t.enableOfflineMode&&(i+="&offline=1"),t.startOffline&&(i+="&startOffline=1"),(t.enableReadOnlyMode||t.isReadOnly)&&(i+="&readonly=1"),t.hideAnnotationPanel&&(i+="&hideAnnotationPanel=1"),t.disableToolGroupReordering&&(i+="&disableToolGroupReordering=1"),t.annotationUser!==void 0&&(i+="&user=".concat(t.annotationUser)),t.annotationAdmin===void 0&&t.isAdminUser===void 0||(i+="&admin=".concat(t.annotationAdmin||t.isAdminUser?1:0)),t.custom!==void 0&&(i+="&custom=".concat(encodeURIComponent(t.custom))),t.showLocalFilePicker===void 0&&t.enableFilePicker===void 0||(i+="&filepicker=".concat(t.showLocalFilePicker||t.enableFilePicker?1:0)),t.fullAPI!==void 0&&(i+="&pdfnet=".concat(t.fullAPI?1:0)),t.enableRedaction!==void 0&&(i+="&enableRedaction=".concat(t.enableRedaction?1:0)),t.disableVirtualDisplayMode!==void 0&&(i+="&disableVirtualDisplayMode=".concat(t.disableVirtualDisplayMode?1:0)),t.hideDetachedReplies!==void 0&&(i+="&hideDetachedReplies=".concat(t.hideDetachedReplies?1:0)),t.enableMeasurement!==void 0&&(i+="&enableMeasurement=".concat(t.enableMeasurement?1:0)),t.showToolbarControl!==void 0&&(i+="&toolbar=".concat(t.showToolbarControl?"true":"false")),t.notesInLeftPanel!==void 0&&(i+="&notesInLeftPanel=".concat(t.notesInLeftPanel?1:0)),t.autoExpandOutlines!==void 0&&(i+="&autoExpandOutlines=".concat(t.autoExpandOutlines?1:0)),t.enableAnnotationNumbering!==void 0&&(i+="&enableAnnotationNumbering=".concat(t.enableAnnotationNumbering?1:0)),t.enableOfficeEditing!==void 0&&(i+="&enableOfficeEditing=".concat(t.enableOfficeEditing?1:0)),t.enableSpreadsheetEditorBeta!==void 0&&(i+="&enableSpreadsheetEditorBeta=".concat(t.enableSpreadsheetEditorBeta?1:0)),t.xdomainProxyUrl!==void 0&&(o=typeof t.xdomainProxyUrl=="string"?{url:t.xdomainProxyUrl}:t.xdomainProxyUrl,i+="&xdomain_urls=".concat(encodeURIComponent(JSON.stringify(o)))),(t.azureWorkaround||t.enableAzureWorkaround)&&(i+="&azureWorkaround=1"),t.enableOptimizedWorkers||(i+="&enableOptimizedWorkers=0"),t.useDownloader||(i+="&useDownloader=0"),t.disableWebsockets&&(i+="&disableWebsockets=1"),t.disableStreaming&&(i+="&disableStreaming=1"),t.forceClientSideInit&&(i+="&forceClientSideInit=1"),t.loadAsPDF&&(i+="&loadAsPDF=1"),t.workerTransportPromise!==void 0&&(i+="&useSharedWorker=".concat(t.workerTransportPromise?"true":"false")),u!==void 0&&u&&(i+="&webviewerServerURL=".concat(encodeURIComponent(u))),t.fallbackToClientSide&&(i+="&fallbackToClientSide=1"),t.singleServerMode!==void 0&&(i+="&singleServerMode=".concat(t.singleServerMode?"true":"false")),t.webviewerServerRangeRequests!==void 0&&(i+="&wvsRange=".concat(t.webviewerServerRangeRequests?"true":"false")),t.accessibleMode!==void 0&&(i+="&accessibleMode=".concat(t.accessibleMode?1:0)),t.disableLogs&&(i+="&disableLogs=1"),t.enableViewStateAnnotations&&(i+="&enableViewStateAnnotations=1"),t.disableFlattenedAnnotations&&(i+="&disableFlattenedAnnotations=1"),t.highContrastMode&&(i+="&highContrastMode=1"),t.selectAnnotationOnCreation!==void 0&&(i+="&selectAnnotationOnCreation=".concat(t.selectAnnotationOnCreation?1:0)),t.autoFocusNoteOnAnnotationSelection!==void 0&&(i+="&autoFocusNoteOnAnnotationSelection=".concat(t.autoFocusNoteOnAnnotationSelection?1:0)),t.disableIndexedDB&&(i+="&disableIndexedDB=1"),t.disableMultiViewerComparison&&(i+="&disableMultiViewerComparison=1"),t.showInvalidBookmarks&&(i+="&showInvalidBookmarks=1"),t.disableObjectURLBlobs&&(i+="&disableObjectURLBlobs=".concat(t.disableObjectURLBlobs)),i+="&id=".concat(this.id),(i+="&basePath=".concat(encodeURIComponent(window.location.pathname))).length>0&&i[0]==="&"&&(i="#".concat(i.slice(1))),i+="&webViewerJSVersion=".concat(this.version),t.ui&&(i+="&ui=".concat(t.ui)),t.uiConfig&&(i+="&uiConfig=".concat(t.uiConfig)),i},setInstanceData:function(e){j.set(this.element,{iframe:e,l:this.options.l||this.options.licenseKey,workerTransportPromise:this.options.workerTransportPromise})},_createHTML5:function(){var e=this,n=this.options.uiPath+this._getHTML5OptionsURL(),o=document.createElement("iframe");this.setInstanceData(o),o.id="webviewer-".concat(this.id),o.src=n,o.title="webviewer",o.frameBorder=0,o.width="100%",o.height="100%",o.setAttribute("allowfullscreen",!0),o.setAttribute("webkitallowfullscreen",!0),o.setAttribute("mozallowfullscreen",!0),this.iframe=o,this.options.backgroundColor&&o.setAttribute("data-bgcolor",this.options.backgroundColor),this.options.assetPath&&o.setAttribute("data-assetpath",encodeURIComponent(this.options.assetPath)),this.element.appendChild(o),window.addEventListener("message",function t(u){if(u.data.type==="viewerLoaded"&&u.data.id===e.id)try{e.instance=e.iframe.contentWindow.instance}catch{}finally{window.removeEventListener("message",t),e._viewerLoaded(e.iframe)}})},_createHTML5Mobile:function(){var e=this,n=this.options.uiPath+this._getHTML5OptionsURL(),o=document.createElement("iframe");this.setInstanceData(o),o.id="webviewer-".concat(this.id),o.src=n,o.frameborder=0,this.options.assetPath&&o.setAttribute("data-assetpath",encodeURIComponent(this.options.assetPath)),o.style.width="100%",o.style.height="100%",this.iframe=o,this.element.appendChild(o),window.addEventListener("message",function t(u){if(u.data.type==="viewerLoaded"&&u.data.id===e.id)try{e.instance=e.iframe.contentWindow.instance}catch{}finally{window.removeEventListener("message",t),e._viewerLoaded(e.iframe)}})},dispose:function(){var e=this;return new Promise(function(n){j.delete(e.element),V.delete(e.element),window.removeEventListener("message",e.messageHandler),e.iframe=null,console.clear(),e.instance.Core.documentViewer.unmount().then(function(){n()})})},getInstance:function(){return this.instance},setCompleteInstance:function(e){this.completeInstance=e},getCompleteInstance:function(){return this.completeInstance},_correctRelativePath:function(e){var n=window.location.pathname;return Array.isArray(e)?e.map(function(o){return l(o,n)}):l(e,n)},_testHTML5:function(){try{var e=document.createElement("canvas");return e&&e.getContext("2d")}catch{return!1}},_testWebAssembly:function(){return!(!window.WebAssembly||!window.WebAssembly.validate)},_testCORS:function(){return"XMLHttpRequest"in window&&"withCredentials"in new XMLHttpRequest},isIE:function(){var e=navigator.userAgent.toLowerCase(),n=/(msie) ([\w.]+)/.exec(e)||/(trident)(?:.*? rv:([\w.]+)|)/.exec(e);return n&&parseInt(n[2],10)},isMobileDevice:function(){return!this.isIE()&&(this.scrollbarWidth()===0&&navigator.userAgent.match(/Edge/i)||navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/Touch/i)||navigator.userAgent.match(/IEMobile/i)||navigator.userAgent.match(/Silk/i))},scrollbarWidth:function(){var e=document.createElement("div");e.style.cssText="width:100px;height:100px;overflow:scroll !important;position:absolute;top:-9999px",document.body.appendChild(e);var n=e.offsetWidth-e.clientWidth;return document.body.removeChild(e),n},isSameOrigin:function(e){var n=window.location,o=document.createElement("a");o.href=e,o.host===""&&(o.href=o.href);var t=window.location.port,u=o.port;return o.protocol==="http:"?(u=u||"80",t=t||"80"):o.protocol==="https:"&&(u=u||"443",t=t||"443"),o.hostname===n.hostname&&o.protocol===n.protocol&&u===t}},h.WebViewer.Options={initialDoc:void 0,annotationAdmin:void 0,isAdminUser:void 0,annotationUser:void 0,assetPath:void 0,autoCreate:!0,autoFocusNoteOnAnnotationSelection:!0,azureWorkaround:!1,additionalTranslations:void 0,enableAzureWorkaround:!1,enableOptimizedWorkers:!0,backgroundColor:void 0,backendType:void 0,css:void 0,config:void 0,custom:void 0,documentId:void 0,documentType:void 0,preloadWorker:void 0,extension:void 0,enableAnnotations:!0,filename:void 0,disableI18n:!1,disabledElements:void 0,disableWebsockets:!1,enableOfflineMode:!1,enableReadOnlyMode:!1,isReadOnly:!1,enableRedaction:!1,disableVirtualDisplayMode:!1,enableMeasurement:!1,encryption:void 0,externalPath:void 0,hideAnnotationPanel:!1,disableToolGroupReordering:!1,uiPath:"./ui/index.html",l:void 0,licenseKey:void 0,mobileRedirect:!1,path:"",pdfBackend:void 0,webviewerServerURL:void 0,webviewerServerRangeRequests:!0,fallbackToClientSide:!1,singleServerMode:!1,fullAPI:!1,preloadPDFWorker:!0,serverUrl:void 0,serverUrlHeaders:void 0,showLocalFilePicker:!1,enableFilePicker:!1,showToolbarControl:void 0,startOffline:!1,streaming:void 0,type:"html5",useDownloader:!0,workerTransportPromise:void 0,xdomainProxyUrl:void 0,ui:void 0,uiConfig:void 0,forceClientSideInit:!1,loadAsPDF:!1,accessibleMode:void 0,disableLogs:!1,enableViewStateAnnotations:!1,highContrastMode:!1,selectAnnotationOnCreation:!1,notesInLeftPanel:!1,autoExpandOutlines:!1,enableAnnotationNumbering:!1,enableOfficeEditing:!1,enableSpreadsheetEditorBeta:!1,documentXFDFRetriever:void 0,disableMultiViewerComparison:void 0,showInvalidBookmarks:!0,disableObjectURLBlobs:!1,disableFlattenedAnnotations:!1,disableStreaming:!1};var G=function(e){for(var n=D(j),o=0;o<n.length;o++){var t=n[o];if(t.iframe===e)return t}return null},F=T;F.l=function(e){var n=G(e);return n&&n.l},F.workerTransportPromise=function(e){var n=G(e);return n&&n.workerTransportPromise},F.WorkerTypes={ALL:"all",OFFICE:"office",LEGACY_OFFICE:"legacyOffice",PDF:"pdf",CONTENT_EDIT:"contentEdit",OFFICE_EDITOR:"officeEditor"},F.BackendTypes=s;var $=function(e){var n=D(j);if(!n.length||!n.filter(function(o){return o.instance}).length)return console.warn("WebViewer.getInstance() was called before any instances were available"),null;if(n.length>1&&!e)throw new Error("More than one instance of WebViewer was found, and no element was passed into getInstance(). Please specify which instance you want to get.");return e?(j.get(e)||{}).instance:(n[0]||{}).instance},Q=function(e,n){j.set(e,{instance:n})};F.getInstance=$,window.WebViewer=F,F.WebComponent=F,F.Iframe=function(e,n){return new Promise(function(o,t){e.l=e.l||e.licenseKey,e.azureWorkaround=e.azureWorkaround||e.enableAzureWorkaround,e.annotationAdmin=e.annotationAdmin||e.isAdminUser,e.enableReadOnlyMode=e.enableReadOnlyMode||e.isReadOnly,e.showLocalFilePicker=e.showLocalFilePicker||e.enableFilePicker,n.addEventListener("ready",function i(){n.removeEventListener("ready",i);try{var p=n.querySelector("iframe").contentWindow;if(p.Core.Tools===void 0)throw new Error("Viewer isn't instantiated correctly. It could be caused by the 'path' option in the WebViewer constructor not being defined correctly. The 'path' option should be relative to the HTML file you're loading the script on and the lib folder needs to be publicly accessible.");var d=u.getInstance(),y={iframeWindow:p,dispose:u.dispose.bind(u)},g=R({},d,f({},d.UI_NAMESPACE_KEY,a(a({},d[d.UI_NAMESPACE_KEY]),y)));u.setCompleteInstance(g);var M=Promise.resolve();if(e.documentXFDFRetriever&&(M=g[d.CORE_NAMESPACE_KEY].documentViewer.setDocumentXFDFRetriever(e.documentXFDFRetriever)),e.additionalTranslations){var E=e.additionalTranslations;g[d.UI_NAMESPACE_KEY].setTranslations(E.language,E.translations)}M.then(function(){o(g)})}catch{if("config"in e&&e.config!=="")return o();t("Viewer is on a different domain, the promise from WebViewer function is rejected and API functions will not work because of cross domain permissions. See https://docs.apryse.com/documentation/web/guides/wv-inside/#loading-webviewer-from-another-domain for more information.")}});var u=new h.WebViewer(e,n)})},v.default=F}])})})(te);var ne=te.exports;const ae=ie(ne),ce=re({__proto__:null,default:ae},[ne]);export{ce as w};
