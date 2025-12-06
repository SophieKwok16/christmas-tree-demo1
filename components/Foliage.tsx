import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { CONFIG, COLORS } from '../constants';

// Add type support for R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const FOLIAGE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uProgress; // 0.0 = Scattered, 1.0 = Tree
  
  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aPhase;
  attribute float aSize;

  varying float vAlpha;
  varying vec3 vColor;

  // Cubic ease in-out
  float ease(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = ease(uProgress);
    
    // Mix positions
    vec3 pos = mix(aScatterPos, aTreePos, t);
    
    // Add some "breathing" movement based on noise/time
    float breath = sin(uTime * 2.0 + aPhase) * 0.1;
    if (uProgress > 0.8) {
        pos.x += breath * 0.2;
        pos.z += breath * 0.2;
        pos.y += breath * 0.1;
    } else {
        // Float drift when scattered
        pos.y += sin(uTime * 0.5 + aPhase) * 0.5;
        pos.x += cos(uTime * 0.3 + aPhase) * 0.2;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    
    // Varying opacity based on sparkle
    float sparkle = sin(uTime * 3.0 + aPhase * 10.0);
    vAlpha = 0.6 + 0.4 * sparkle;
    
    // Color gradient based on height (Y)
    float heightMix = smoothstep(-5.0, 10.0, pos.y);
    // Mix between dark emerald and a slightly lighter/gold tip
    vColor = mix(vec3(0.0, 0.2, 0.05), vec3(0.0, 0.5, 0.15), heightMix);
  }
`;

const FOLIAGE_FRAGMENT_SHADER = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // Circular particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if (dist > 0.5) discard;
    
    // Soft edge
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor + vec3(0.1, 0.1, 0.0) * glow, vAlpha * glow);
  }
`;

interface FoliageProps {
  progress: React.MutableRefObject<number>;
}

export const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const count = CONFIG.FOLIAGE_COUNT;

  const data = useMemo(() => {
    const treePos = new Float32Array(count * 3);
    const scatterPos = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Tree Shape (Cone)
      // Normalize height 0 to 1
      const hRatio = Math.random(); 
      const y = hRatio * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2);
      // Radius decreases as height increases
      const r = (1 - hRatio) * CONFIG.TREE_RADIUS_BASE; 
      // Random angle
      const theta = Math.random() * Math.PI * 2;
      // Volume distribution (not just surface)
      const volRadius = r * Math.sqrt(Math.random());

      treePos[i * 3] = volRadius * Math.cos(theta);
      treePos[i * 3 + 1] = y;
      treePos[i * 3 + 2] = volRadius * Math.sin(theta);

      // Scatter Shape (Sphere/Cloud)
      const sr = CONFIG.SCATTER_RADIUS * Math.cbrt(Math.random());
      const phi = Math.acos(2 * Math.random() - 1);
      const sTheta = Math.random() * Math.PI * 2;

      scatterPos[i * 3] = sr * Math.sin(phi) * Math.cos(sTheta);
      scatterPos[i * 3 + 1] = sr * Math.sin(phi) * Math.sin(sTheta);
      scatterPos[i * 3 + 2] = sr * Math.cos(phi);

      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 0.5 + 0.3;
    }

    return { treePos, scatterPos, phases, sizes };
  }, [count]);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      shaderRef.current.uniforms.uProgress.value = progress.current;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Required by three, though we override in shader
          count={count}
          array={data.treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={data.treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={data.scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={count}
          array={data.phases}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={data.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={FOLIAGE_VERTEX_SHADER}
        fragmentShader={FOLIAGE_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
        }}
      />
    </points>
  );
};