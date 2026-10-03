import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface OpportunityZoneProps {
  progressRef: React.MutableRefObject<number>;
}

const ROUTES: [THREE.Vector3, THREE.Vector3][] = [
  [new THREE.Vector3(-2.9, 0.05, -1.85), new THREE.Vector3(-0.18, 0.05, -0.1)],
  [new THREE.Vector3(2.7, 0.05, -1.6), new THREE.Vector3(0.18, 0.05, -0.1)],
  [new THREE.Vector3(0.2, 0.05, 2.65), new THREE.Vector3(0.08, 0.05, 0.18)],
  [new THREE.Vector3(0.18, 0.05, -0.1), new THREE.Vector3(1.1, 0.05, 0.22)],
];

export const OpportunityZone: React.FC<OpportunityZoneProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const routeGeometries = useMemo(() => ROUTES.map(([start, end]) => new THREE.BufferGeometry().setFromPoints([start, end])), []);
  const contourGeometries = useMemo(() => [0, 1, 2].map((index) => {
    const radius = 2.4 - index * 0.62;
    const points = Array.from({ length: 49 }, (_, point) => {
      const angle = (point / 48) * Math.PI * 2;
      const wobble = 1 + Math.sin(angle * 3 + 0.6) * 0.08 + Math.cos(angle * 5) * 0.035;
      return new THREE.Vector3(Math.cos(angle) * radius * wobble, 0.03 + index * 0.002, Math.sin(angle) * radius * wobble * 0.72);
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const p = progressRef.current;
    const visibility = THREE.MathUtils.smoothstep(p, 0.65, 0.70) * (1 - THREE.MathUtils.smoothstep(p, 0.80, 0.835));
    groupRef.current.visible = visibility > 0.01;
    if (markerRef.current) {
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2.1) * 0.08;
      markerRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef} position={[-6, 1.5, -26]}>
      {/* A survey plate replaces the generic target: three evidence routes meet at a quiet zone. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[12, 7.4]} />
        <meshStandardMaterial color="#121413" roughness={0.95} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {contourGeometries.map((geometry, index) => (
        <lineLoop key={index} geometry={geometry}>
          <lineBasicMaterial color={index === 0 ? '#b8ce72' : '#8e8b84'} transparent opacity={index === 0 ? 0.56 : 0.22} />
        </lineLoop>
      ))}
      {routeGeometries.map((geometry, index) => (
        <line key={index} geometry={geometry}>
          <lineBasicMaterial color={index === 1 || index === 3 ? '#c8a873' : '#aaa69c'} transparent opacity={index === 1 || index === 3 ? 0.9 : 0.55} />
        </line>
      ))}

      {[
        { position: [-2.9, 0.16, -1.85] as [number, number, number], label: 'MARKET ACTIVITY', value: '+32% POSTS' },
        { position: [2.7, 0.16, -1.6] as [number, number, number], label: 'REPEATED ANGLE', value: '3 BRANDS' },
        { position: [0.2, 0.16, 2.65] as [number, number, number], label: 'COVERAGE GAP', value: '2 / 18' },
      ].map((source) => (
        <group key={source.label} position={source.position}>
          <mesh>
            <boxGeometry args={[0.28, 0.1, 0.28]} />
            <meshStandardMaterial color="#77766c" roughness={0.8} />
          </mesh>
          <Text position={[0, 0.75, 0]} fontSize={0.17} color="#aaa69c" anchorX="center" anchorY="middle" maxWidth={2.5}>
            {source.label}
          </Text>
          <Text position={[0, 0.48, 0]} fontSize={0.16} color="#f2eee4" anchorX="center" anchorY="middle">
            {source.value}
          </Text>
        </group>
      ))}

      <mesh ref={markerRef} position={[0, 0.14, 0]}>
        <boxGeometry args={[0.36, 0.16, 0.36]} />
        <meshStandardMaterial color="#c8a873" roughness={0.48} metalness={0.04} />
      </mesh>
      <mesh position={[1.1, 0.15, 0.22]}>
        <boxGeometry args={[0.42, 0.14, 0.36]} />
        <meshStandardMaterial color="#b8ce72" roughness={0.7} />
      </mesh>
    </group>
  );
};
