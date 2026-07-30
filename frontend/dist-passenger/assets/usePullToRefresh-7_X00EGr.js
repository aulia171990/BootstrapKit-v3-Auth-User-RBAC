import{c as n,j as d,I as _,a as p,r}from"./index-cIZteAV5.js";/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"M18 6 7 17l-5-5",key:"116fxf"}],["path",{d:"m22 10-7.5 7.5L13 16",key:"ke71qq"}]],H=n("check-check",g);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],$=n("circle-question-mark",x);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]],q=n("history",N);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],P=n("house",b);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],S=n("log-out",L);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]],w=n("message-circle",E);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],z=n("save",j);function I({items:a=[],className:s,...c}){return d.jsx("nav",{className:p("ds-bottom-nav",s),...c,children:a.map(e=>d.jsxs("button",{type:"button",onClick:e.onClick,className:p("ds-bottom-nav__item",e.active&&"is-active"),"aria-current":e.active?"page":void 0,children:[d.jsx("span",{className:"ds-bottom-nav__icon",children:d.jsx(_,{icon:e.icon,size:"md"})}),e.label]},e.id))})}function T({children:a,type:s="fade",duration:c="base",className:e,...i}){return d.jsx("div",{className:p(`ds-page-transition ds-page-${s}`,e),style:{"--ds-page-dur":`var(--ds-duration-${c})`},...i,children:a})}function V(a,{threshold:s=64}={}){const c=r.useRef(null),e=r.useRef(null),[i,o]=r.useState(0),[l,m]=r.useState(!1),f=t=>{e.current=t},M=(t,v)=>{if(e.current==null||l)return;if(v.scrollTop>0){o(0);return}const u=Math.max(0,t-e.current);u>0&&o(Math.min(u*.5,s*1.5))},k=r.useCallback(async()=>{if(!l){if(i>=s){m(!0),o(s);try{await(a==null?void 0:a())}finally{m(!1),o(0)}}else o(0);e.current=null}},[i,l,s,a]);return r.useEffect(()=>{const t=c.current;if(!t)return;const v=h=>f(h.touches[0].clientY),u=h=>M(h.touches[0].clientY,t),y=()=>k();return t.addEventListener("touchstart",v,{passive:!0}),t.addEventListener("touchmove",u,{passive:!0}),t.addEventListener("touchend",y),()=>{t.removeEventListener("touchstart",v),t.removeEventListener("touchmove",u),t.removeEventListener("touchend",y)}},[k]),{containerRef:c,pullDistance:i,refreshing:l,setPullDistance:o}}export{I as B,H as C,q as H,S as L,w as M,T as P,z as S,P as a,$ as b,V as u};
