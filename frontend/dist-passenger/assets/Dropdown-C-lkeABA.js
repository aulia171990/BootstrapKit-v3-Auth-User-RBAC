import{c as s,r as i,j as d,a as h}from"./index-cIZteAV5.js";/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]],M=s("arrow-up-right",x);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],N=s("circle-x",w);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],j=s("info",_);/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],R=s("rotate-ccw",E);function z({trigger:l,children:m,align:y="start",open:o,onOpenChange:c,className:f,...p}){const[k,v]=i.useState(o??!1),n=i.useRef(null),t=o??k,r=e=>{o===void 0&&v(e),c==null||c(e)};return i.useEffect(()=>{const e=a=>{n.current&&!n.current.contains(a.target)&&r(!1)},u=a=>{a.key==="Escape"&&r(!1)};return t&&(document.addEventListener("mousedown",e),document.addEventListener("keydown",u)),()=>{document.removeEventListener("mousedown",e),document.removeEventListener("keydown",u)}},[t]),d.jsxs("div",{className:h("ds-dropdown",f),ref:n,...p,children:[d.jsx("span",{onClick:()=>r(!t),style:{display:"inline-flex",cursor:"pointer"},children:l}),t&&d.jsx("div",{className:"ds-dropdown__menu","data-align":y,role:"menu",children:m})]})}export{M as A,N as C,z as D,j as I,R};
