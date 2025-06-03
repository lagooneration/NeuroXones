import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import PropTypes from 'prop-types';

// Create a shader material using the shader code from Shaderr.jsx
const NeuralMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.1, 0.3, 0.8),
  },
  // Vertex shader
  `
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
  `,
  // Fragment shader
  `
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
  `
);

// Extend the material with @react-three/fiber
import { extend } from '@react-three/fiber';
extend({ NeuralMaterial });

const NeuralActivity = ({ position = [0, 0, 0], scale = 2, rotation = [0, 0, 0], color = '#2389da' }) => {
  const materialRef = useRef();
  const torusRef = useRef();
  
  // Create torus geometry with memoization to avoid unnecessary re-creation
  const geometry = useMemo(() => new THREE.TorusGeometry(1, 0.4, 16, 100), []);
  
  // Convert color string to THREE.Color
  const threeColor = useMemo(() => new THREE.Color(color), [color]);
    // Animation loop
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
    
    // if (torusRef.current) {
    //   torusRef.current.rotation.x += 0.002;
    //   torusRef.current.rotation.y += 0.003;
    // }
  });
  
  /* eslint-disable react/no-unknown-property */
  return (
    <mesh
      ref={torusRef}
      position={position}
      scale={scale}
      rotation={rotation}
      geometry={geometry}
    >
      <neuralMaterial 
        ref={materialRef} 
        transparent={true}
        uColor={threeColor}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
  /* eslint-enable react/no-unknown-property */
};

// Add PropTypes validation
NeuralActivity.propTypes = {
  position: PropTypes.array,
  scale: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
  rotation: PropTypes.array,
  color: PropTypes.string
};

export { NeuralActivity };