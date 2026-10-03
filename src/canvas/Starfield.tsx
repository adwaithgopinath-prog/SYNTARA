import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarfieldProps {
  count?: number;
  progressRef: React.MutableRefObject<number>;
}

export const Starfield: React.FC<StarfieldProps> = ({ count = 1800, progressRef }) => {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, sizes, opacities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.4 + Math.random() * 1.6;
      opacities[i] = 0.2 + Math.random() * 0.6;
    }

    return { positions, sizes, opacities };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    // Very slow drift rotation
    meshRef.current.rotation.y = time * 0.006;
    meshRef.current.rotation.x = time * 0.003;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.5}
        color="#8ea8c0"
        transparent
        opacity={0.55}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};
