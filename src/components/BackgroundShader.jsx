import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const BackgroundShader = () => {
  const { gl, size } = useThree();
  const shaderRef = useRef();

  useEffect(() => {
    shaderRef.current = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        #define TIME iTime
        #define RESOLUTION iResolution
        #define ROT(a) mat2(cos(a), sin(a), -sin(a), cos(a))
        #define PI 3.141592654
        #define TAU (2.0*PI)

        // https://lists.office.com/Images/72f988bf-86f1-41af-91ab-2d7cd011db47/89ec7e89-f5c4-4b93-9c25-3f75e5220995/T7THIPBZ0Z2YSIOMG8GGIG3OWC/615d356e-0a16-4105-814d-f0408c7d5efb
        // License: Unknown, author: nmz (twitter: @stormoid), found: https://www.shadertoy.com/view/NdfyRM
        float sRGB(float t) { return mix(1.055*pow(t, 1./2.4) - 0.055, 12.92*t, step(t, 0.0031308)); }
        // License: Unknown, author: nmz (twitter: @stormoid), found: https://www.shadertoy.com/view/NdfyRM
        vec3 sRGB(in vec3 c) { return vec3 (sRGB(c.x), sRGB(c.y), sRGB(c.z)); }

        // License: Unknown, author: Unknown, found: don't remember
        float tanh_approx(float x) {
          //  Found this somewhere on the interwebs
          //  return tanh(x);
          float x2 = x*x;
          return clamp(x*(27.0 + x2)/(27.0+9.0*x2), -1.0, 1.0);
        }

        // License: WTFPL, author: sam hocevar, found: https://stackoverflow.com/a/17897228/418488
        const vec4 hsv2rgb_K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 hsv2rgb(vec3 c) {
          vec3 p = abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www);
          return c.z * mix(hsv2rgb_K.xxx, clamp(p - hsv2rgb_K.xxx, 0.0, 1.0), c.y);
        }

        // License: WTFPL, author: sam hocevar, found: https://stackoverflow.com/a/17897228/418488
        //  Macro version of above to enable compile-time constants
        #define HSV2RGB(c) (c.z * mix(hsv2rgb_K.xxx, clamp(abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www) - hsv2rgb_K.xxx, 0.0, 1.0), c.y))

        // License: Unknown, author: Unknown, found: don't remember
        float hash(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,58.233))) * 13758.5453);
        }

        // License: Unknown, author: Martijn Steinrucken, found: https://www.youtube.com/watch?v=VmrIDyYiJBA
        vec2 hextile(inout vec2 p) {
          // See Art of Code: Hexagonal Tiling Explained!
          // https://www.youtube.com/watch?v=VmrIDyYiJBA
          const vec2 sz = vec2(1.0, sqrt(3.0));
          const vec2 hsz = 0.5*sz;

          vec2 p1 = mod(p, sz)-hsz;
          vec2 p2 = mod(p - hsz, sz)-hsz;
          vec2 p3 = dot(p1, p1) < dot(p2, p2) ? p1 : p2;
          vec2 n = ((p3 - p + hsz)/sz);
          p = p3;

          n -= vec2(0.5);
          // Rounding to make hextile 0,0 well behaved
          return round(n*2.0)*0.5;
        }

        // License: MIT, author: Inigo Quilez, found: https://iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
        float hexagon(vec2 p, float r) {
          const vec3 k = vec3(-0.866025404,0.5,0.577350269);
          p = abs(p);
          p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
          p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
          return length(p)*sign(p.y);
        }

        float shape(vec2 p) {
          return hexagon(p.yx, 0.4)-0.075;
        }

        float cellHeight(float h) {
          return 0.05*2.0*(-h);
        }

        vec3 cell(vec2 p, float h) {
          float hd = shape(p);

          const float he = 0.0075*2.0;
          float aa = he;
          float hh = -he*smoothstep(aa, -aa, hd);
          
          return vec3(hd, hh, cellHeight(h));
        }

        float height(vec2 p, float h) {
          return cell(p, h).y;
        }

        vec3 normal(vec2 p, float h) {
          vec2 e = vec2(4.0/RESOLUTION.y, 0);
          
          vec3 n;
          n.x = height(p + e.xy, h) - height(p - e.xy, h);
          n.y = height(p + e.yx, h) - height(p - e.yx, h);
          n.z = 2.0*e.x;
          
          return normalize(n);
        }

        vec3 planeColor(vec3 ro, vec3 rd, vec3 lp, vec3 pp, vec3 pnor, vec3 bcol, vec3 pcol) {
          vec3 ld = normalize(lp-pp);
          float dif = pow(max(dot(ld, pnor), 0.0), 1.0);
          vec3 col = pcol;
          col = mix(bcol, col, dif);
          return col;
        }

        const mat2 rots[6] = mat2[](
            ROT(0.0*TAU/6.0)
          , ROT(1.0*TAU/6.0)
          , ROT(2.0*TAU/6.0)
          , ROT(3.0*TAU/6.0)
          , ROT(4.0*TAU/6.0)
          , ROT(5.0*TAU/6.0)
        ); 

        const vec2 off = vec2(1.0, 0.0);

        const vec2 offs[6] = vec2[](
            off*rots[0]
          , off*rots[1]
          , off*rots[2]
          , off*rots[3]
          , off*rots[4]
          , off*rots[5]
        );
          
        float cutSlice(vec2 p, vec2 off) {
          // A bit like this but unbounded
          // https://www.shadertoy.com/view/MlycD3
          p.x = abs(p.x);
          off.x *= 0.5; 

          vec2 nn = normalize(vec2(off));
          vec2 n = vec2(nn.y, -nn.x);

          float d0 = length(p-off);
          float d1 = -(p.y-off.y);
          float d2 = dot(n, p);
          
          bool b = p.x > off.x && (dot(nn, p)-dot(nn, off)) < 0.0;
          
          return b ? d0 : max(d1, d2);
        }

        float hexSlice(vec2 p, int n) {
          n = 6-n;
          n = n%6;
          p *= rots[n];
          p = p.yx;
          const vec2 dim = vec2((0.5)*2.0/sqrt(3.0), (0.5));
          return cutSlice(p, dim);
        }

        vec3 effect(vec2 p, vec2 q) {
          const float z = 0.327;
          float aa = 2.0/(z*RESOLUTION.y);
          
          p.yx = p;
          
          vec3 lp = vec3(3.0, 0.0, 1.0);
          
          p -= vec2(0.195, 0.);
          p /= z;

          float toff = 0.2*TIME;
          p.x += toff;
          lp.x += toff;

          vec2 hp = p;
          vec2 hn = hextile(hp);
          float hh = hash(hn);
          vec3 c = cell(hp, hh);
          float cd = c.x;
          float ch = c.z;  

          vec3 fpp = vec3(p, ch);
          vec3 bpp = vec3(p, 0.0);

          vec3 ro = vec3(0.0, 0.0, 1.0);
          vec3 rd = normalize(fpp-ro);

          vec3 bnor = vec3(0.0, 0.0, 1.0);
          vec3 bdif = lp-bpp;
          float bl2 = dot(bdif, bdif);

          vec3 fnor = normal(hp, hh);
          vec3 fld = normalize(lp-fpp); 

          float sf = 0.0;

          for (int i = 0; i < 6; ++i) {
            vec2 ioff = offs[i];
            vec2 ip = p+ioff;
            vec2 ihn = hextile(ip);
            float ihh = hash(ihn);
            float ich = cellHeight(ihh);
            float iii = (ich-ch)/fld.z;
            vec3 ipp = vec3(hp, ch)+iii*fld;
            
            float hsd = hexSlice(ipp.xy, i);
            if (ich > ch) {
              sf += exp(-20.0*tanh_approx(1.0/(10.0*iii))*max(hsd+0., 0.0));
            }
          }

          const float sat = 0.23;
          vec3 bpcol = planeColor(ro, rd, lp, bpp, bnor, vec3(0.0), HSV2RGB(vec3(240.0/36.0, sat, 0.14)));
          vec3 fpcol = planeColor(ro, rd, lp, fpp, fnor, bpcol, HSV2RGB(vec3(240.0/36.0, sat, 0.19)));

          vec3 col = bpcol;
          col = mix(col, fpcol, smoothstep(aa, -aa, cd));
          col *= 1.0-tanh_approx(sf);

          float fo = exp(-0.025*max(bl2-0., 0.0));
          col *= fo;
          col = mix(bpcol, col, fo);


          return col;
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          vec2 q = fragCoord/RESOLUTION.xy; 
          vec2 p = -1. + 2. * q;
          p.x *= RESOLUTION.x/RESOLUTION.y;
          
          vec3 col = effect(p, q);
          col = sRGB(col);
          
          fragColor = vec4(col,1.0);
        }

        varying vec2 vUv;

        uniform float uTime;
        uniform vec2 uResolution;

        void main() {
          mainImage(gl_FragColor, vUv * uResolution);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
      },
    });
  }, [size]);

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh  position={[0, 0, -10]}>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial ref={shaderRef} attach="material" uniforms={shaderRef.current?.uniforms} vertexShader={shaderRef.current?.vertexShader} fragmentShader={shaderRef.current?.fragmentShader} />
    </mesh>
  );
};

export default BackgroundShader;