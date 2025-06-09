import { twMerge } from "tailwind-merge";
import { useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame, extend } from "@react-three/fiber";
import PropTypes from 'prop-types';
import * as THREE from "three";

// Create a shader material for the neural network effect
class NeuralNetworkMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() },
        mousePosition: { value: new THREE.Vector2(0.5, 0.5) },
        colorIntensity: { value: 2.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 mousePosition;
        uniform float colorIntensity;
        varying vec2 vUv;

        #define S(a, b, t) smoothstep(a, b, t)
        #define NUM_LAYERS 4.

        float N21(vec2 p) {
          vec3 a = fract(vec3(p.xyx) * vec3(613.897, 553.453, 80.098));
          a += dot(a, a.yzx + 88.76);
          return fract((a.x + a.y) * a.z);
        }

        vec2 GetPos(vec2 id, vec2 offs, float t) {
          float n = N21(id+offs);
          float n1 = fract(n*0.7);
          float n2 = fract(n*79.7);
          float a = t+n;
          return offs + vec2(sin(a*n1), cos(a*n2))*0.5;
        }

        float GetT(vec2 ro, vec2 rd, vec2 p) {
          return dot(p-ro, rd); 
        }

        float LineDist(vec3 a, vec3 b, vec3 p) {
          return length(cross(b-a, p-a))/length(p-a);
        }

        float df_line(in vec2 a, in vec2 b, in vec2 p) {
          vec2 pa = p - a, ba = b - a;
          float h = clamp(dot(pa,ba) / dot(ba,ba), 0., 1.);	
          return length(pa - ba * h);
        }

        float line(vec2 a, vec2 b, vec2 uv) {
          float r1 = 0.002;
          float r2 = .0001;
          
          float d = df_line(a, b, uv);
          float d2 = length(a-b);
          float fade = S(0.005, .05, d2);
          
          fade += S(.0005, .0002, abs(d2-.025));
          return S(r1, r2, d)*fade;
        }

        float NetLayer(vec2 st, float n, float t) {
          vec2 id = floor(st)+n;

          st = fract(st)-.5;
        
          vec2 p[9];
          int i=0;
          for(float y=-1.; y<=1.; y++) {
            for(float x=-1.; x<=1.; x++) {
                p[i++] = GetPos(id, vec2(x,y), t);
            }
          }
          
          float m = 0.;
          float sparkle = 0.;
          
          for(int i=0; i<9; i++) {
            m += line(p[4], p[i], st);

            float d = length(st-p[i]);

            float s = (.002/(d*d));
            s *= S(1., .1, d);
            float pulse = sin((fract(p[i].x)+fract(p[i].y)+t)*5.)*.4+.6;
            pulse = pow(pulse, 20.);

            s *= pulse;
            sparkle += s;
          }
          
          m += line(p[1], p[3], st);
          m += line(p[1], p[5], st);
          m += line(p[7], p[5], st);
          m += line(p[7], p[3], st);
          
          float sPhase = (sin(t+n)+sin(t*.1))*.25+.5;
          sPhase += pow(sin(t*.1)*.5+.5, 50.)*5.;
          m += sparkle*sPhase;
          
          return m;
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy / resolution.xy) * 2.0 - 1.0;
          uv.x *= resolution.x / resolution.y; // Correct for aspect ratio
          
          vec2 mouse = mousePosition * 2.0 - 1.0; // Normalize mouse position
          
          float t = time * 0.5;
          
          float s = sin(t * 0.2);
          float c = cos(t * 0.2);
          mat2 rot = mat2(c, -s, s, c);
          vec2 st = uv * rot;
          mouse = mouse * rot * 0.3;
          
          float m = 0.;
          for(float i=0.; i<1.; i+=1./NUM_LAYERS) {
            float z = fract(t*0.2+i);
            float size = mix(15., 1.5, z);
            float fade = S(0., .3, z) * S(1., .7, z);
            
            m += fade * NetLayer(st*size-mouse*z, i, time * 0.5);
          }
          
          vec3 baseCol = vec3(s * 0.5 + 0.5, cos(t*0.1) * 0.5 + 0.5, -sin(t*0.14) * 0.5 + 0.5) * 0.2 + 0.1;
          baseCol = mix(baseCol, vec3(0.3, 0.4, 1.0), 0.5); // Add more blue shade for neural network feel
          
          vec3 col = baseCol * m * colorIntensity;
          
          // Add subtle glow effect
          float glow = -uv.y * 0.4;
          col += baseCol * glow;
          
          // Vignette effect
          col *= 1.0 - length(uv * vec2(0.8, 1.2)) * 0.6;
          
          gl_FragColor = vec4(col, m * 0.75 + 0.2);
        }
      `,
      transparent: true,
      depthWrite: false
    });
  }
}

// Register the material as a custom element
extend({ NeuralNetworkMaterial });

// Create the full screen quad that will render our shader
function NeuralNetwork() {
  const materialRef = useRef();
  const { size } = useThree();
  const [mousePosition, setMousePosition] = useState([0.5, 0.5]);
  
  // Handle mouse movements
  useEffect(() => {
    function handleMouseMove(e) {
      setMousePosition([
        e.clientX / window.innerWidth, 
        1 - (e.clientY / window.innerHeight) // Flip Y coordinates
      ]);
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Update shader uniforms on each frame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.resolution.value.set(size.width, size.height);
      materialRef.current.uniforms.mousePosition.value.set(mousePosition[0], mousePosition[1]);
    }
  });
  
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <neuralNetworkMaterial ref={materialRef} />
    </mesh>
  );
}

// Main component exported to be used in the app
export const Particles = ({
  className = "",
  refresh, // Destructure refresh prop but don't use it
  ...props
}) => {
  // Remove refresh from props to prevent it from being passed to the DOM
  const { refresh: _, ...restProps } = props;
  
  return (
    <div
      className={twMerge("pointer-events-none", className)}
      aria-hidden="true"
      {...restProps}
      style={{ width: '100%', height: '100%', ...props.style }}
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <NeuralNetwork />
      </Canvas>
    </div>
  );
};

Particles.propTypes = {
  className: PropTypes.string,
  refresh: PropTypes.bool,
  style: PropTypes.object,
  quantity: PropTypes.number,
  ease: PropTypes.number,
  color: PropTypes.string
};
