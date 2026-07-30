import{j as e,I as f,a as c,T as k,c as l,C as M}from"./index-cIZteAV5.js";const S=["primary","secondary","outline","ghost","destructive","success","warning","link"],I=["xs","sm","md","lg","xl"];function $({children:s,variant:a="primary",size:t="md",leftIcon:o,rightIcon:n,loading:r=!1,fullWidth:d=!1,circle:h=!1,type:p="button",disabled:u=!1,ariaLabel:y,className:m,...x}){S.includes(a)||(a="primary"),I.includes(t)||(t="md");const b=u||r,w=a==="destructive"?"danger":a,A=s==null;return e.jsxs("button",{type:p,className:c("ds-btn",`ds-btn--${w}`,`ds-btn--${t}`,d&&"ds-btn--block",h&&"ds-btn--circle",r&&"is-loading",m),disabled:b,"aria-busy":r||void 0,"aria-label":A?y:void 0,...x,children:[r&&e.jsx("span",{className:"ds-btn__spinner","aria-hidden":"true",children:e.jsx("span",{className:"ds-btn__ring"})}),!r&&o&&e.jsx(f,{icon:o,size:"sm",className:"ds-btn__icon"}),s!=null&&e.jsx("span",{className:"ds-btn__label",children:s}),!r&&n&&e.jsx(f,{icon:n,size:"sm",className:"ds-btn__icon"})]})}const T={xs:24,sm:32,md:40,lg:56,xl:72};function pe({src:s,name:a,size:t="md",tone:o="primary",rounded:n="full",status:r="none",badge:d,className:h,...p}){const u=(a||"").split(" ").map(x=>x[0]).filter(Boolean).slice(0,2).join("").toUpperCase(),y=typeof t=="number"?t:T[t]||40,m={online:"var(--ds-color-success)",busy:"var(--ds-color-danger)",away:"var(--ds-color-warning)",offline:"var(--ds-color-text-muted)"}[r];return e.jsxs("span",{className:c("ds-avatar",h),style:{width:y,height:y,borderRadius:n==="full"?"var(--ds-radius-full)":`var(--ds-radius-${n})`,background:k[o],fontSize:y*.4},"aria-label":a?`Avatar of ${a}`:void 0,...p,children:[s?e.jsx("img",{src:s,alt:a||"",className:"ds-avatar__img"}):u,r!=="none"&&e.jsx("span",{className:"ds-avatar__status",style:{background:m},"aria-hidden":"true"}),d&&e.jsx("span",{className:"ds-avatar__badge",children:d})]})}function ue({children:s,tone:a="neutral",dot:t=!1,className:o,...n}){return e.jsxs("span",{className:c("ds-badge",`ds-badge--${a}`,o),style:{"--ds-badge-color":k[a]||"var(--ds-color-text-muted)"},...n,children:[t&&e.jsx("span",{className:"ds-badge__dot","aria-hidden":"true"}),s]})}/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]],ye=l("bell",C);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],me=l("circle-check-big",R);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M12 17h.01",key:"p32p05"}],["path",{d:"M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3",key:"mhlwft"}]],q=l("file-question-mark",E);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=[["polyline",{points:"22 12 16 12 14 15 10 15 8 12 2 12",key:"o97t9d"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}]],g=l("inbox",V);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],B=l("lock",z);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],xe=l("map-pin",D);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],fe=l("navigation",L);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],H=l("refresh-cw",O);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=[["path",{d:"m13.5 8.5-5 5",key:"1cs55j"}],["path",{d:"m8.5 8.5 5 5",key:"a8mexj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],F=l("search-x",P);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=[["path",{d:"M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2",key:"4b9dqc"}],["path",{d:"M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2",key:"22nnkd"}],["path",{d:"M6 6h.01",key:"1utrut"}],["path",{d:"M6 18h.01",key:"uhywen"}],["path",{d:"m13 6-4 6h6l-4 6",key:"14hqih"}]],_=l("server-crash",U);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=[["path",{d:"m2 2 20 20",key:"1ooewy"}],["path",{d:"M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71",key:"1jlk70"}],["path",{d:"M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264",key:"18rp1v"}]],Z=l("shield-off",W);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],j=l("triangle-alert",Q);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]],ve=l("truck",X);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],ke=l("user",G);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],ge=l("users",J);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],N=l("wifi-off",K);function i({variant:s="rect",width:a,height:t,radius:o="sm",className:n,...r}){return e.jsx("span",{className:c("ds-skeleton",`ds-skeleton--${s}`,n),"aria-hidden":"true",style:{width:a,height:t,borderRadius:s==="circle"?"50%":`var(--ds-radius-${o})`},...r})}function Y({header:s=!0,sidebar:a=!1,lines:t=6,className:o,...n}){return e.jsxs("div",{className:c("ds-skeleton-page",o),"aria-hidden":"true",...n,children:[s&&e.jsxs("div",{className:"ds-skeleton-page__header",children:[e.jsx(i,{variant:"rect",height:40,width:"40%",radius:"sm"}),e.jsx(i,{variant:"rect",height:32,width:32,radius:"sm"})]}),e.jsxs("div",{className:"ds-skeleton-page__body",style:{display:"flex",gap:16},children:[a&&e.jsx("div",{className:"ds-skeleton-page__sidebar",style:{width:"30%",display:"flex",flexDirection:"column",gap:8},children:Array.from({length:4}).map((r,d)=>e.jsx(i,{variant:"rect",height:36,radius:"sm"},d))}),e.jsx("div",{className:"ds-skeleton-page__content",style:{flex:1},children:Array.from({length:t}).map((r,d)=>e.jsx(i,{variant:"rect",height:16,radius:"sm",style:{width:d===t-1?"60%":"100%",marginBottom:8}},d))})]})]})}function ee({image:s=!1,avatar:a=!1,lines:t=3,className:o,...n}){return e.jsxs("div",{className:c("ds-skeleton-card",o),"aria-hidden":"true",...n,style:{border:"1px solid var(--ds-color-border)",borderRadius:"var(--ds-radius-lg)",padding:16,display:"flex",flexDirection:"column",gap:12},children:[s&&e.jsx(i,{variant:"rect",height:140,radius:"md"}),e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"center"},children:[a&&e.jsx(i,{variant:"circle",width:40,height:40}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:6},children:[e.jsx(i,{variant:"rect",height:14,width:"70%",radius:"sm"}),e.jsx(i,{variant:"rect",height:10,width:"40%",radius:"sm"})]})]}),Array.from({length:t}).map((r,d)=>e.jsx(i,{variant:"rect",height:10,radius:"sm",style:{width:d===t-1?"50%":"100%"}},d))]})}function se({count:s=4,avatar:a=!0,lines:t=2,className:o,...n}){return e.jsx("div",{className:c("ds-skeleton-list",o),"aria-hidden":"true",...n,style:{display:"flex",flexDirection:"column",gap:2},children:Array.from({length:s}).map((r,d)=>e.jsxs("div",{style:{display:"flex",gap:10,padding:"12px 0",borderBottom:d<s-1?"1px solid var(--ds-color-border)":"none"},children:[a&&e.jsx(i,{variant:"circle",width:40,height:40}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:6},children:[e.jsx(i,{variant:"rect",height:13,width:"60%",radius:"sm"}),t>1&&e.jsx(i,{variant:"rect",height:10,width:"40%",radius:"sm"})]})]},d))})}function ae({rows:s=5,cols:a=4,className:t,...o}){return e.jsxs("div",{className:c("ds-skeleton-table",t),"aria-hidden":"true",...o,children:[e.jsx("div",{style:{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid var(--ds-color-border)"},children:Array.from({length:a}).map((n,r)=>e.jsx(i,{variant:"rect",height:12,radius:"sm",style:{flex:r===0?2:1}},r))}),Array.from({length:s}).map((n,r)=>e.jsx("div",{style:{display:"flex",gap:12,padding:"12px 0",borderBottom:r<s-1?"1px solid var(--ds-color-border)":"none"},children:Array.from({length:a}).map((d,h)=>e.jsx(i,{variant:"rect",height:10,radius:"sm",style:{flex:h===0?2:1}},h))},r))]})}function te({size:s=40,className:a,...t}){return e.jsx(i,{variant:"circle",width:s,height:s,className:c("ds-skeleton-avatar",a),...t})}function re({width:s="100%",height:a=200,className:t,...o}){return e.jsx("div",{className:c("ds-skeleton-image",t),"aria-hidden":"true",...o,style:{width:s,height:a,background:"var(--ds-color-surface-3)",borderRadius:"var(--ds-radius-md)",display:"grid",placeItems:"center",color:"var(--ds-color-text-muted)",fontSize:13},children:e.jsx(i,{variant:"rect",width:"100%",height:"100%",radius:"md"})})}function ne({labelWidth:s="30%",inputHeight:a=40,className:t,...o}){return e.jsxs("div",{className:c("ds-skeleton-form",t),"aria-hidden":"true",...o,style:{display:"flex",flexDirection:"column",gap:6,padding:"4px 0"},children:[e.jsx(i,{variant:"rect",height:12,width:s,radius:"sm"}),e.jsx(i,{variant:"rect",height:a,radius:"sm"})]})}function _e({variant:s="rect",width:a,height:t,radius:o="sm",lines:n=1,className:r,...d}){return s==="page"?e.jsx(Y,{lines:n,className:r,...d}):s==="card"?e.jsx(ee,{lines:n,className:r,...d}):s==="list"?e.jsx(se,{count:n,className:r,...d}):s==="table"?e.jsx(ae,{rows:n,className:r,...d}):s==="avatar"?e.jsx(te,{size:a||40,className:r,...d}):s==="image"?e.jsx(re,{width:a,height:t||200,className:r,...d}):s==="form"?e.jsx(ne,{className:r,...d}):s==="text"&&n>1?e.jsx("span",{className:c("ds-skeleton-wrap",r),"aria-hidden":"true",...d,children:Array.from({length:n}).map((h,p)=>e.jsx("span",{className:"ds-skeleton ds-skeleton--text",style:{width:p===n-1?"60%":"100%"}},p))}):e.jsx(i,{variant:s,width:a,height:t,radius:o,className:r,...d})}const de={empty:g,noResult:F,noInternet:N,permissionDenied:B,notFound:q,forbidden:Z,serverError:_},oe={empty:"Nothing here yet",noResult:"No results found",noInternet:"No internet connection",permissionDenied:"Permission denied",notFound:"Page not found",forbidden:"Access denied",serverError:"Server error"};function je({icon:s,title:a,description:t,action:o,variant:n="empty",illustration:r,className:d,...h}){const p=s??de[n]??g,u=a??oe[n];return e.jsxs("div",{className:c("ds-state",d),"data-tone":n==="error"||n==="serverError"?"error":"empty",...h,children:[r?e.jsx("div",{className:"ds-state__illustration",children:r}):e.jsx("span",{className:"ds-state__icon",children:e.jsx(f,{icon:p,size:"xl"})}),e.jsx("h3",{className:"ds-state__title",children:u}),t&&e.jsx("p",{className:"ds-state__desc",children:t}),o&&e.jsx("div",{className:"ds-state__actions",children:o})]})}const ie={error:j,network:N,timeout:M,server:_},ce={error:"Something went wrong",network:"Connection failed",timeout:"Request timed out",server:"Server error"},le={error:"Please try again. If the problem persists, contact support.",network:"Unable to connect to the server. Check your internet connection.",timeout:"The request took too long. Please try again.",server:"The server encountered an error. Please try again later."};function Ne({icon:s,title:a,description:t,action:o,variant:n="error",onRetry:r,retryLabel:d="Try Again",className:h,...p}){const u=s??ie[n]??j,y=a??ce[n],m=t??le[n],x=o||(r?e.jsxs($,{variant:"primary",onClick:r,children:[e.jsx(H,{size:14})," ",d]}):null);return e.jsxs("div",{className:c("ds-state",h),"data-tone":"error",...p,children:[e.jsx("span",{className:"ds-state__icon",children:e.jsx(f,{icon:u,size:"xl"})}),e.jsx("h3",{className:"ds-state__title",children:y}),m&&e.jsx("p",{className:"ds-state__desc",children:m}),x&&e.jsx("div",{className:"ds-state__actions",children:x})]})}const v={primary:"var(--ds-color-primary)",secondary:"var(--ds-color-secondary)",success:"var(--ds-color-success)",warning:"var(--ds-color-warning)",danger:"var(--ds-color-danger)",info:"var(--ds-color-info)",neutral:"var(--ds-color-text-muted)"};function be({tone:s="neutral",label:a,pulse:t=!1,className:o,...n}){return e.jsxs("span",{className:c("ds-status",o),...n,children:[e.jsx("span",{className:c("ds-status__dot",t&&"ds-status__dot--pulse"),style:{background:v[s]||v.neutral}}),a&&e.jsx("span",{children:a})]})}export{pe as A,ye as B,me as C,Ne as E,B as L,xe as M,fe as N,H as R,_e as S,j as T,ke as U,N as W,$ as a,be as b,je as c,ge as d,ue as e,ve as f};
