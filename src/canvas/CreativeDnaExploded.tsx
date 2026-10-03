import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { CREATIVE_DNA_LAYERS } from '../data/intelligenceData';

const PAPER_SHADES = ['#d8d0c0', '#c8bfaf', '#e1d9c9', '#d0c6b4', '#e6decf', '#cfc5b4', '#ddd4c4'];

interface CreativeDnaExplodedProps {
  progressRef: React.MutableRefObject<number>;
}

export const CreativeDnaExploded: React.FC<CreativeDnaExplodedProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progressRef.current;

    // Active in Scene 08: 0.50 to 0.62
    const visibility = THREE.MathUtils.smoothstep(p, 0.50, 0.54) * (1 - THREE.MathUtils.smoothstep(p, 0.59, 0.63));
    groupRef.current.visible = visibility > 0.01;

    // Explosion progress: 0 when just entering, 1 when fully separated
    const explosion = THREE.MathUtils.smoothstep(p, 0.52, 0.58);

    groupRef.current.children.forEach((child, index) => {
      const layer = CREATIVE_DNA_LAYERS[index];
      if (layer && child instanceof THREE.Group) {
        // Explode along Z
        const targetZ = layer.offsetZ * explosion;
        child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, 0.15);
        // Tilt slightly as it separates
        child.rotation.x = (1 - explosion) * 0.1;
      }
    });

    const s = THREE.MathUtils.lerp(0.01, 1.0, visibility);
    groupRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      <pointLight position={[-2, 3, 5]} intensity={5} distance={16} decay={2} color="#f2eee4" />
      <pointLight position={[3, -1, 3]} intensity={1.2} distance={10} decay={2} color="#c8a873" />
      {CREATIVE_DNA_LAYERS.map((layer, index) => (
        <group key={layer.category} position={[0, 0, 0]}>
          {/* Inked paper layers separate to expose their role in the original. */}
          <mesh>
            <boxGeometry args={[4.2, 1.4, 0.09]} />
            <meshStandardMaterial color={PAPER_SHADES[index]} roughness={0.94} metalness={0} />
          </mesh>

          <mesh position={[-2.02, 0, 0.051]}>
            <boxGeometry args={[0.035, 1.38, 0.012]} />
            <meshBasicMaterial color={layer.color} />
          </mesh>
          <mesh position={[0.65, -0.18, 0.052]}>
            <boxGeometry args={[2.22, 0.012, 0.01]} />
            <meshBasicMaterial color="#46443e" transparent opacity={0.34} />
          </mesh>

          {/* Category Tag (HOOK / MESSAGE / FORMAT / etc.) */}
          <Text
            position={[-1.75, 0.42, 0.08]}
            fontSize={0.17}
            color={layer.color}
            anchorX="left"
            anchorY="middle"
            letterSpacing={0.1}
          >
            {`${layer.category} / CREATIVE DNA`}
          </Text>

          {/* Main Title */}
          <Text
            position={[-1.75, 0.08, 0.08]}
            fontSize={0.22}
            color="#171817"
            maxWidth={3.6}
            anchorX="left"
            anchorY="middle"
          >
            {layer.title}
          </Text>

          {/* Description */}
          <Text
            position={[-1.75, -0.32, 0.08]}
            fontSize={0.14}
            color="#55534d"
            maxWidth={3.6}
            anchorX="left"
            anchorY="middle"
          >
            {layer.description}
          </Text>
        </group>
      ))}
    </group>
  );
};
