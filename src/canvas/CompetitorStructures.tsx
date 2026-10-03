import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { COMPETITORS } from '../data/intelligenceData';
import { CompetitorData } from '../types';

interface CompetitorStructuresProps {
  progressRef: React.MutableRefObject<number>;
  onSelectCompetitor: (comp: CompetitorData) => void;
  hoveredCompId: string | null;
  setHoveredCompId: (id: string | null) => void;
  competitors?: CompetitorData[];
}

export const CompetitorStructures: React.FC<CompetitorStructuresProps> = ({
  progressRef,
  onSelectCompetitor,
  hoveredCompId,
  setHoveredCompId,
  competitors = COMPETITORS,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const signalBeamRef = useRef<THREE.Line>(null);
  const pulseMeshRef = useRef<THREE.Mesh>(null);
  const signalCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 2.5, -18),
    new THREE.Vector3(-9, 4, -20),
    new THREE.Vector3(-8, 2.8, -22),
  ]), []);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(signalCurve.getPoints(32)), [signalCurve]);

  useFrame((state) => {
    const p = progressRef.current;
    const time = state.clock.getElapsedTime();
    const enter = THREE.MathUtils.smoothstep(p, 0.27, 0.29);
    const leave = THREE.MathUtils.smoothstep(p, 0.50, 0.56);
    const visibility = enter * (1 - leave);
    if (groupRef.current) {
      groupRef.current.visible = visibility > 0.01;
      groupRef.current.position.y = THREE.MathUtils.lerp(-2, 0, enter) - leave * 2;
      groupRef.current.scale.set(1, 1, 1);
    }
    const active = THREE.MathUtils.smoothstep(p, 0.35, 0.42) * (1 - THREE.MathUtils.smoothstep(p, 0.52, 0.60));
    if (signalBeamRef.current) (signalBeamRef.current.material as THREE.LineBasicMaterial).opacity = active * 0.82;
    if (pulseMeshRef.current) {
      pulseMeshRef.current.visible = active > 0.05;
      pulseMeshRef.current.position.copy(signalCurve.getPoint((time * 0.28) % 1));
      const scale = (Math.sin(time * 4) * 0.1 + 0.9) * active;
      pulseMeshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      {competitors.map((comp) => {
        const isNorthstar = comp.id === 'northstar';
        const isHovered = hoveredCompId === comp.id;
        const postCount = isNorthstar ? 7 : comp.id === 'orbit' ? 6 : comp.id === 'monday' ? 4 : 5;
        return (
          <group
            key={comp.id}
            position={comp.position}
            scale={0.82}
            onClick={(e) => { e.stopPropagation(); onSelectCompetitor(comp); }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredCompId(comp.id); }}
            onPointerOut={() => setHoveredCompId(null)}
          >
            {/* Low archive plinth: activity is shown as a stream of published pieces. */}
            <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.3, 0.16, 2.1]} />
              <meshStandardMaterial color="#191a19" roughness={0.88} metalness={0.03} />
            </mesh>
            <mesh position={[0, -0.025, 0.96]}>
              <boxGeometry args={[2.7, 0.025, 0.018]} />
              <meshBasicMaterial color={comp.color} />
            </mesh>

            {Array.from({ length: postCount }, (_, index) => {
              const cadence = index / Math.max(postCount - 1, 1);
              const width = 1.55 + Math.sin(index * 2.1 + comp.observedPosts) * 0.48;
              return (
                <group key={index} position={[(index % 2) * 0.12 - 0.06, 0.08 + cadence * 0.2, (index - (postCount - 1) / 2) * 0.2]}>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[width, 0.12, 0.76]} />
                    <meshStandardMaterial color={index === postCount - 1 ? comp.color : '#393a36'} roughness={0.72} metalness={0.04} />
                  </mesh>
                  <mesh position={[-width * 0.31, 0.066, 0]}>
                    <boxGeometry args={[width * 0.23, 0.012, 0.53]} />
                    <meshBasicMaterial color={isHovered ? '#f2eee4' : '#aaa69c'} transparent opacity={isHovered ? 0.62 : 0.27} />
                  </mesh>
                </group>
              );
            })}

            <Text position={[0, 0.96, 0]} fontSize={0.3} color="#f2eee4" anchorX="center" anchorY="middle" maxWidth={4}>
              {comp.name}
            </Text>
            <Text position={[0, 0.58, 0]} fontSize={0.15} color={comp.color} anchorX="center" anchorY="middle" maxWidth={4}>
              {comp.velocityChange.toUpperCase()}
            </Text>
            <Text position={[0, 0.32, 0]} fontSize={0.11} color="#8e8b84" anchorX="center" anchorY="middle">
              {`${comp.observedPosts} POSTS · 30 DAYS`}
            </Text>
          </group>
        );
      })}

      {/* Syntara's archive is the reference point: quiet, layered, and connected. */}
      <group position={[0, 0.2, -10]}>
        {[0, 1, 2, 3].map((layer) => (
          <mesh key={layer} position={[0, layer * 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.8 - layer * 0.18, 0.12, 2.8 - layer * 0.16]} />
            <meshStandardMaterial color={layer === 3 ? '#d8d0c0' : '#292b29'} roughness={0.82} metalness={0.02} />
          </mesh>
        ))}
        <mesh position={[0, 0.88, 0.94]}>
          <boxGeometry args={[2.3, 0.035, 0.018]} />
          <meshBasicMaterial color="#c8a873" />
        </mesh>
        <Text position={[0, 1.52, 0]} fontSize={0.36} color="#f2eee4" anchorX="center" anchorY="middle">
          SYNTARA
        </Text>
        <Text position={[0, 1.13, 0]} fontSize={0.16} color="#8e8b84" anchorX="center" anchorY="middle">
          LOCAL BRAND PROFILE
        </Text>
      </group>

      <line ref={signalBeamRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#c8a873" transparent opacity={0} linewidth={2} />
      </line>
      <mesh ref={pulseMeshRef} visible={false}>
        <boxGeometry args={[0.3, 0.08, 0.08]} />
        <meshBasicMaterial color="#f2eee4" />
      </mesh>
    </group>
  );
};
