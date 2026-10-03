import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface LearningLoop3DProps {
  progressRef: React.MutableRefObject<number>;
}

const LOOP_NODES = [
  { label: 'MARKET', color: '#c5bca8' },
  { label: 'SIGNAL', color: '#c8a873' },
  { label: 'PATTERN', color: '#b8ce72' },
  { label: 'OPPORTUNITY', color: '#b8ce72' },
  { label: 'CAMPAIGN', color: '#c5bca8' },
  { label: 'RESULT', color: '#8e8b84' },
  { label: 'LEARNING', color: '#c8a873' },
];

const RADIUS_X = 6.6;
const RADIUS_Y = 3.5;

export const LearningLoop3D: React.FC<LearningLoop3DProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const packetRef = useRef<THREE.Mesh>(null);
  const trackGeometry = useMemo(() => {
    const points = Array.from({ length: 97 }, (_, index) => {
      const angle = (index / 96) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * RADIUS_X, Math.sin(angle) * RADIUS_Y, 0);
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const visibility = THREE.MathUtils.smoothstep(progressRef.current, 0.94, 0.97);
    groupRef.current.visible = visibility > 0.01;
    const scale = THREE.MathUtils.lerp(0.01, 1, visibility);
    groupRef.current.scale.set(scale, scale, scale);
    if (packetRef.current) {
      const angle = (state.clock.getElapsedTime() * 0.26) % (Math.PI * 2);
      packetRef.current.position.set(Math.cos(angle) * RADIUS_X, Math.sin(angle) * RADIUS_Y, 0.08);
    }
  });

  return (
    <group ref={groupRef} position={[0, 2.4, -12]}>
      <lineLoop geometry={trackGeometry}>
        <lineBasicMaterial color="#77766c" transparent opacity={0.68} />
      </lineLoop>
      <lineLoop geometry={trackGeometry} scale={[0.96, 0.91, 1]}>
        <lineBasicMaterial color="#c8a873" transparent opacity={0.12} />
      </lineLoop>

      {LOOP_NODES.map((node, index) => {
        // Pull the result marker toward the open lower-left quadrant so it does
        // not sit under the centered feedback copy at the end of the journey.
        const angle = index === 5 ? 3.9 : (Math.PI * 2 * index) / LOOP_NODES.length;
        const x = Math.cos(angle) * RADIUS_X;
        const y = Math.sin(angle) * RADIUS_Y;
        return (
          <group key={node.label} position={[x, y, 0]}>
            <mesh>
              <boxGeometry args={[2.3, 0.62, 0.12]} />
              <meshStandardMaterial color="#1c1d1b" roughness={0.9} metalness={0.02} />
            </mesh>
            <mesh position={[-1.05, 0, 0.07]}>
              <boxGeometry args={[0.035, 0.5, 0.016]} />
              <meshBasicMaterial color={node.color} />
            </mesh>
            <Text position={[0, 0, 0.09]} fontSize={0.17} color="#f2eee4" anchorX="center" anchorY="middle" letterSpacing={0.05}>
              {`${String(index + 1).padStart(2, '0')}  ${node.label}`}
            </Text>
          </group>
        );
      })}

      <mesh ref={packetRef}>
        <boxGeometry args={[0.4, 0.11, 0.12]} />
        <meshBasicMaterial color="#f2eee4" />
      </mesh>

    </group>
  );
};
