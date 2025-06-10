import{u as U,j as e,L as Z,r as t,T as ee,C as $,a as te,D as se,e as re,P as h,b as F,c as oe}from"./index-BYGCyQlB.js";import{s as ie}from"./shaderMaterial-C2FNOz3U.js";U.preload("/models/human_brain.glb");const ne=()=>e.jsxs("div",{className:"relative inline-flex items-center justify-center gap-4 group",children:[e.jsx("div",{className:"absolute inset-0 duration-1000 opacity-60 transitiona-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"}),e.jsxs(Z,{to:"/simulation",className:"group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30",children:["Simulate",e.jsxs("svg",{"aria-hidden":"true",viewBox:"0 0 10 10",height:10,width:10,fill:"none",className:"mt-0.5 ml-2 -mr-1 stroke-white stroke-2",children:[e.jsx("path",{d:"M0 5h7",className:"transition opacity-0 group-hover:opacity-100"}),e.jsx("path",{d:"M1 1l4 4-4 4",className:"transition group-hover:translate-x-[3px]"})]})]})]}),ae=ie({uTime:0,uColor:new $(.1,.3,.8)},`
  uniform float uTime;

  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Random 2D function from includes
  float random2D(vec2 st){
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Glitch
    float glitchTime = uTime - modelPosition.y;
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) +  sin(glitchTime * 8.76);
    glitchStrength /= 3.0;
    glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
    glitchStrength *= 0.25;
    modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
    modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;

    // Final position
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Model normal
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    // Varyings
    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
  }
  `,`
  uniform vec3 uColor;
  uniform float uTime;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    // Normal
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing)
        normal *= - 1.0;
  
    // Stripes
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.0);
  
    // Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);
  
    // Falloff
    float falloff = smoothstep(0.8, 0.2, fresnel);
  
    // Holographic
    float holographic = stripes * fresnel;
    holographic += fresnel * 1.25;
    holographic *= falloff;
  
    // Final color
    gl_FragColor = vec4(uColor, holographic);
    
    // Tone mapping and color space adjustments
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
  `);re({NeuralMaterial:ae});const A=({position:c=[0,0,0],scale:x=2,rotation:N=[0,0,0],color:f="#2389da"})=>{const u=t.useRef(),p=t.useRef(),v=t.useMemo(()=>new ee(1,.4,16,100),[]),b=t.useMemo(()=>new $(f),[f]);return te(y=>{u.current&&(u.current.uTime=y.clock.elapsedTime)}),e.jsx("mesh",{ref:p,position:c,scale:x,rotation:N,geometry:v,children:e.jsx("neuralMaterial",{ref:u,transparent:!0,uColor:b,side:se})})};A.propTypes={position:h.array,scale:h.oneOfType([h.number,h.array]),rotation:h.array,color:h.string};const le=({text:c="Compressa",fontFamily:x="Compressa VF",fontUrl:N="https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2",width:f=!0,weight:u=!0,italic:p=!0,alpha:v=!1,flex:b=!0,stroke:y=!1,scale:z=!1,textColor:M="#FFFFFF",strokeColor:D="#FF0000",strokeWidth:I=2,className:B="",minFontSize:C=24})=>{const g=t.useRef(null),d=t.useRef(null),P=t.useRef([]),n=t.useRef({x:0,y:0}),l=t.useRef({x:0,y:0}),[_,G]=t.useState(C),[H,S]=t.useState(1),[V,E]=t.useState(1),R=c.split(""),O=(r,o)=>{const s=o.x-r.x,i=o.y-r.y;return Math.sqrt(s*s+i*i)};t.useEffect(()=>{const r=s=>{l.current.x=s.clientX,l.current.y=s.clientY},o=s=>{const i=s.touches[0];l.current.x=i.clientX,l.current.y=i.clientY};if(window.addEventListener("mousemove",r),window.addEventListener("touchmove",o,{passive:!1}),g.current){const{left:s,top:i,width:a,height:m}=g.current.getBoundingClientRect();n.current.x=s+a/2,n.current.y=i+m/2,l.current.x=n.current.x,l.current.y=n.current.y}return()=>{window.removeEventListener("mousemove",r),window.removeEventListener("touchmove",o)}},[]);const T=()=>{if(!g.current||!d.current)return;const{width:r,height:o}=g.current.getBoundingClientRect();let s=r/(R.length/2);s=Math.max(s,C),G(s),S(1),E(1),requestAnimationFrame(()=>{if(!d.current)return;const i=d.current.getBoundingClientRect();if(z&&i.height>0){const a=o/i.height;S(a),E(a)}})};return t.useEffect(()=>(T(),window.addEventListener("resize",T),()=>window.removeEventListener("resize",T)),[z,c]),t.useEffect(()=>{let r;const o=()=>{if(n.current.x+=(l.current.x-n.current.x)/15,n.current.y+=(l.current.y-n.current.y)/15,d.current){const i=d.current.getBoundingClientRect().width/2;P.current.forEach(a=>{if(!a)return;const m=a.getBoundingClientRect(),Y={x:m.x+m.width/2,y:m.y+m.height/2},j=O(n.current,Y),w=(K,k,L)=>{const Q=L-Math.abs(L*K/i);return Math.max(k,Q+k)},q=f?Math.floor(w(j,5,200)):100,X=u?Math.floor(w(j,100,900)):400,W=p?w(j,0,1).toFixed(2):0,J=v?w(j,0,1).toFixed(2):1;a.style.opacity=J,a.style.fontVariationSettings=`'wght' ${X}, 'wdth' ${q}, 'ital' ${W}`})}r=requestAnimationFrame(o)};return o(),()=>cancelAnimationFrame(r)},[f,u,p,v,R.length]),e.jsxs("div",{ref:g,className:"relative w-full h-full overflow-hidden bg-transparent",children:[e.jsx("style",{children:`
        @font-face {
          font-family: '${x}';
          src: url('${N}');
          font-style: normal;
        }
        .stroke span {
          position: relative;
          color: ${M};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${I}px;
          -webkit-text-stroke-color: ${D};
        }
      `}),e.jsx("h1",{ref:d,className:`text-pressure-title ${B} ${b?"flex justify-between":""} ${y?"stroke":""} uppercase text-center`,style:{fontFamily:x,fontSize:_,lineHeight:V,transform:`scale(1, ${H})`,transformOrigin:"center top",margin:0,fontWeight:100,color:y?void 0:M},children:R.map((r,o)=>e.jsx("span",{ref:s=>P.current[o]=s,"data-char":r,className:"inline-block",children:r},o))})]})},ce=()=>e.jsx("div",{className:"w-full relative mx-3 h-[80px] md:h-[240px] sm:h-[120px] xs:h-[80px]",children:e.jsx(le,{text:"ATTENTION!",flex:!0,alpha:!1,stroke:!1,width:!0,weight:!0,italic:!0,textColor:"#ffffff",strokeColor:"#ff0000",minFontSize:36})}),me=()=>{const c=t.useRef();return t.useRef(),e.jsxs("section",{className:"c-space section-spacing",id:"about",children:[e.jsx(ce,{}),e.jsxs("div",{className:"grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12",children:["        ",e.jsxs("div",{className:"flex items-end grid-default-color grid-1",children:[e.jsx(F,{src:"assets/hp.png",className:"absolute scale-[1.75] -right-[5rem] -top-[1rem] md:scale-[3] md:left-50 md:inset-y-10 lg:scale-[2.5]",alt:"Headphone visualization"}),e.jsxs("div",{className:"z-10",children:[e.jsx("p",{className:"headtext",children:"Move beyond passive listening"}),e.jsx("p",{className:"subtext",children:"Actively identifying your attentional focus and dynamically enhancing the audio in real-time, precisely as per the user's conscious intent"})]}),e.jsx("div",{className:"absolute inset-x-0 pointer-evets-none -bottom-4 h-1/2 sm:h-1/3 bg-gradient-to-t from-indigo"})]}),e.jsx("div",{className:"grid-default-color grid-2",children:e.jsxs("div",{ref:c,className:"flex items-center justify-center w-full h-full",children:["            ",e.jsx(F,{src:"images/vr.png",className:"absolute z-0 -top-[30px]",alt:"VR headset visualization"}),e.jsx("div",{className:"z-10",children:e.jsx("p",{className:"absolute left-4 bottom-4 headtext",children:"AR/VR Integration"})})]})}),e.jsxs("div",{className:"grid-black-color grid-3",children:[e.jsxs("div",{className:"z-10 w-[50%]",children:[e.jsx("p",{className:"headtext",children:"Temporal Response Fn"}),e.jsx("p",{className:"subtext",children:"(TRF) facilitates a mapping b/w features of sound & EEG responses from the auditory cortex"})]}),e.jsx("figure",{className:"absolute left-[25%] top-[5%] w-[70%] h-[70%]",children:e.jsxs(oe,{camera:{position:[0,0,5],fov:50},className:"w-full h-full",style:{pointerEvents:"none"},gl:{antialias:!0,alpha:!0},dpr:[1,2],children:[e.jsx("ambientLight",{}),e.jsx("directionalLight",{position:[10,10,5],intensity:2}),e.jsx(A,{scale:1.25,position:[.8,-.2,.16],rotation:[-Math.PI/2,-Math.PI/72,0],color:"#4f9dff"})]})})]}),e.jsx("div",{className:"grid-special-color grid-4",children:e.jsxs("div",{className:"flex flex-col items-center justify-center gap-4 size-full",children:[e.jsx("p",{className:"text-center headtext",children:"Experience Neuro-Steered listening?"}),e.jsx(ne,{})]})}),e.jsx("div",{className:"grid-default-color grid-5",children:e.jsxs("div",{ref:c,className:"flex items-center justify-center w-full h-full",children:["            ",e.jsx(F,{src:"assets/ci.png",className:"absolute z-0 -top-[80px]",alt:"Cochlear Implant visualization"}),e.jsx("div",{className:"z-10",children:e.jsx("p",{className:"absolute left-4 bottom-4 headtext",children:"Cochlear Implant Integration"})})]})})]})]})};export{me as default};
