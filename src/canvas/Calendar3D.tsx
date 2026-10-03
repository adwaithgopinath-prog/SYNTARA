import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { CALENDAR_ENTRIES } from '../data/intelligenceData';

interface Calendar3DProps {
  progressRef: React.MutableRefObject<number>;
}

export const Calendar3D: React.FC<Calendar3DProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const paperShades = ['#d8d0c0', '#cec4b3', '#dfd6c6', '#d4c9b7', '#e4dbcb'];

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progressRef.current;
    const visibility = THREE.MathUtils.smoothstep(p, 0.89, 0.92) * (1 - THREE.MathUtils.smoothstep(p, 0.94, 0.96));
    groupRef.current.visible = visibility > 0.01;
    const slotFactor = THREE.MathUtils.smoothstep(p, 0.91, 0.94);
    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Group) {
        child.position.x = (index - 2) * 2.35;
        child.position.z = THREE.MathUtils.lerp(-4 - index * 1.2, 0, slotFactor);
        child.position.y = (1 - slotFactor) * 1.5;
      }
    });
    const scale = THREE.MathUtils.lerp(0.01, 1, visibility);
    groupRef.current.scale.set(scale * 0.85, scale, scale);
  });

  return (
    <group ref={groupRef} position={[0, 0.65, -4]}>
      {CALENDAR_ENTRIES.map((entry, entryIndex) => {
        const accent = entry.format === 'REEL' ? '#c8a873' : entry.format === 'STORY' ? '#b8ce72' : '#c5bca8';
        return (
          <group key={entry.day} position={[0, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.5, 3.6, 0.08]} />
            <meshStandardMaterial color={paperShades[entryIndex]} roughness={0.94} metalness={0} />
            </mesh>
            <mesh position={[-1.08, 0, 0.055]}>
              <boxGeometry args={[0.035, 3.46, 0.015]} />
              <meshBasicMaterial color={accent} />
            </mesh>
            <Text position={[-0.98, 1.36, 0.06]} fontSize={0.25} color="#171817" anchorX="left" anchorY="middle">
              {entry.day}
            </Text>
            <Text position={[0.98, 1.36, 0.06]} fontSize={0.14} color="#55534d" anchorX="right" anchorY="middle">
              {entry.date}
            </Text>
            <mesh position={[0, 1.05, 0.055]}>
              <boxGeometry args={[1.96, 0.018, 0.012]} />
              <meshBasicMaterial color="#6d685f" transparent opacity={0.42} />
            </mesh>
            <Text position={[-0.98, 0.72, 0.06]} fontSize={0.13} color={accent} anchorX="left" anchorY="middle">
              {entry.format}
            </Text>
            <Text position={[-0.98, 0.13, 0.06]} fontSize={0.18} color="#171817" maxWidth={1.96} anchorX="left" anchorY="middle">
              {entry.title}
            </Text>
            <Text position={[-0.98, -0.69, 0.06]} fontSize={0.12} color="#55534d" anchorX="left" anchorY="middle">
              {`${entry.pillar.toUpperCase()} · ${entry.status.toUpperCase()}`}
            </Text>
            <mesh position={[0, -1.34, 0.06]}>
              <boxGeometry args={[1.95, 0.016, 0.012]} />
              <meshBasicMaterial color="#f2eee4" transparent opacity={0.18} />
            </mesh>
            <Text position={[-0.98, -1.56, 0.06]} fontSize={0.12} color="#b8ce72" anchorX="left" anchorY="middle">
              {entry.perfMetric.toUpperCase()}
            </Text>
            {[0, 1, 2, 3, 4, 5].map((bar) => {
              const height = 0.06 + ((bar * 7 + entryIndex * 3) % 5) * 0.035;
              return (
              <mesh key={bar} position={[-0.79 + bar * 0.3, -1.11 + height / 2, 0.062]}>
                <boxGeometry args={[0.16, height, 0.012]} />
                <meshBasicMaterial color={accent} transparent opacity={0.23 + bar * 0.07} />
              </mesh>
            );})}
          </group>
        );
      })}
    </group>
  );
};
