import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { CONFIG, COLORS } from '../constants';

// Add type support for R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface OrnamentsProps {
  progress: React.MutableRefObject<number>;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ progress }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = CONFIG.ORNAMENT_COUNT;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-calculate positions
  const data = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      // Tree Position
      const hRatio = Math.random();
      const yTree = hRatio * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2);
      // Ornaments sit slightly outside the foliage radius
      const rTree = ((1 - hRatio) * CONFIG.TREE_RADIUS_BASE) + 0.2; 
      const theta = Math.random() * Math.PI * 2;
      
      const treePos = new THREE.Vector3(
        rTree * Math.cos(theta),
        yTree,
        rTree * Math.sin(theta)
      );

      // Scatter Position
      const sr = CONFIG.SCATTER_RADIUS * 0.8 * Math.cbrt(Math.random());
      const phi = Math.acos(2 * Math.random() - 1);
      const sTheta = Math.random() * Math.PI * 2;
      
      const scatterPos = new THREE.Vector3(
        sr * Math.sin(phi) * Math.cos(sTheta),
        sr * Math.sin(phi) * Math.sin(sTheta),
        sr * Math.cos(phi)
      );

      const scale = Math.random() * 0.4 + 0.2;
      const rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      const rotationSpeed = Math.random() * 0.5;

      items.push({ treePos, scatterPos, scale, rotationAxis, rotationSpeed });
    }
    return items;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = progress.current;
    // Cubic ease for smoothness
    const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const time = state.clock.elapsedTime;

    data.forEach((item, i) => {
      // Lerp Position
      const currentPos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, easedT);
      
      // Floating effect when scattered
      if (t < 0.9) {
        currentPos.y += Math.sin(time + i) * 0.05 * (1 - t);
        currentPos.x += Math.cos(time * 0.5 + i) * 0.05 * (1 - t);
      }

      // Rotate item
      dummy.position.copy(currentPos);
      dummy.scale.setScalar(item.scale * (0.8 + 0.2 * easedT)); // Slightly smaller when scattered
      
      // Spin
      dummy.rotation.set(0,0,0);
      dummy.rotateOnAxis(item.rotationAxis, time * item.rotationSpeed);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color={COLORS.GOLD_POLISHED} 
        metalness={1.0} 
        roughness={0.15} 
        envMapIntensity={2}
      />
    </instancedMesh>
  );
};