import React, { useRef, useState } from 'react';
import { useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { CONFIG } from '../constants';
import { TreeState } from '../types';

// Add type support for R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface SceneProps {
  mode: string;
}

export const Scene: React.FC<SceneProps> = ({ mode }) => {
  const { camera } = useThree();
  const progressRef = useRef(0);
  
  // Animate the camera slightly based on mouse
  useFrame((state) => {
    const target = mode === TreeState.TREE ? 1 : 0;
    // Smooth transition logic
    progressRef.current = THREE.MathUtils.lerp(
      progressRef.current, 
      target, 
      0.02 * CONFIG.TRANSITION_SPEED
    );

    // Subtle camera drift
    const time = state.clock.elapsedTime;
    if (mode === TreeState.SCATTERED) {
       camera.position.x = Math.sin(time * 0.1) * 30;
       camera.position.z = Math.cos(time * 0.1) * 30;
       camera.lookAt(0,0,0);
    }
  });

  return (
    <>
      <color attach="background" args={['#000502']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} color="#002200" />
      <pointLight position={[10, 20, 10]} intensity={2.5} color="#ffd700" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00ff44" />
      <spotLight 
        position={[0, 30, 0]} 
        intensity={2} 
        angle={0.5} 
        penumbra={1} 
        castShadow 
      />

      {/* Content */}
      <group position={[0, -2, 0]}>
        <Foliage progress={progressRef} />
        <Ornaments progress={progressRef} />
      </group>

      {/* Environment & Effects */}
      <Environment preset="city" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ContactShadows 
        opacity={0.7} 
        scale={20} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />

      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={50}
        makeDefault
      />
    </>
  );
};