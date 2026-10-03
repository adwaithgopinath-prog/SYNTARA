import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface CreativeStudio3DProps {
  progressRef: React.MutableRefObject<number>;
}

export const CreativeStudio3D: React.FC<CreativeStudio3DProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const audienceRef = useRef<THREE.Group>(null);
  const ctaRef = useRef<THREE.Group>(null);
  const variationsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progressRef.current;
    const visibility = THREE.MathUtils.smoothstep(p, 0.86, 0.88) * (1 - THREE.MathUtils.smoothstep(p, 0.91, 0.935));
    if (groupRef.current) {
      groupRef.current.visible = visibility > 0.01;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.01, 1, visibility));
    }
    const reveal = (ref: React.RefObject<THREE.Group>, start: number, end: number) => {
      if (!ref.current) return;
      const amount = THREE.MathUtils.smoothstep(p, start, end);
      ref.current.visible = amount > 0.01;
      ref.current.scale.set(1, amount, 1);
    };
    reveal(visualRef, 0.872, 0.885);
    reveal(audienceRef, 0.884, 0.897);
    reveal(ctaRef, 0.896, 0.91);
    reveal(variationsRef, 0.907, 0.924);
  });

  return (
    <group ref={groupRef} position={[-4.2, 1.1, -12]} rotation={[0, 0.055, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.25, 5.15, 0.11]} />
        <meshStandardMaterial color="#e3ddcf" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[-2.02, 0, 0.07]}>
        <boxGeometry args={[0.055, 5.05, 0.025]} />
        <meshBasicMaterial color="#c8a873" />
      </mesh>
      <Text position={[-1.72, 2.12, 0.08]} fontSize={0.13} color="#605b51" anchorX="left" anchorY="middle" letterSpacing={0.05}>
        SYNTARA / CREATIVE STUDIO / 01
      </Text>
      <Text position={[-1.72, 1.53, 0.08]} fontSize={0.35} color="#171817" anchorX="left" anchorY="middle" maxWidth={3.35}>
        A better question changes the brief.
      </Text>
      <mesh position={[-0.03, 1.15, 0.075]}>
        <boxGeometry args={[3.35, 0.016, 0.018]} />
        <meshBasicMaterial color="#7f796f" transparent opacity={0.52} />
      </mesh>
      <group ref={visualRef} position={[0, 0.65, 0.08]}>
        <Text position={[-1.72, 0.14, 0]} fontSize={0.11} color="#8a8172" anchorX="left" anchorY="middle">
          VISUAL CONCEPT
        </Text>
        <Text position={[-1.72, -0.1, 0]} fontSize={0.16} color="#292a27" anchorX="left" anchorY="middle" maxWidth={3.2}>
          Split-frame teardown: the brief before the insight, then after.
        </Text>
        <mesh position={[1.32, -0.09, -0.01]}>
          <boxGeometry args={[0.34, 0.46, 0.025]} />
          <meshStandardMaterial color="#b8ce72" roughness={0.8} />
        </mesh>
        <mesh position={[1.32, -0.09, 0.01]}>
          <boxGeometry args={[0.12, 0.46, 0.025]} />
          <meshStandardMaterial color="#b8674a" roughness={0.8} />
        </mesh>
      </group>
      <group ref={audienceRef} position={[0, -0.28, 0.08]}>
        <mesh position={[0, 0.21, -0.005]}>
          <boxGeometry args={[3.35, 0.015, 0.012]} />
          <meshBasicMaterial color="#7f796f" transparent opacity={0.36} />
        </mesh>
        <Text position={[-1.72, -0.02, 0]} fontSize={0.1} color="#8a8172" anchorX="left" anchorY="middle">
          AUDIENCE / PLATFORM
        </Text>
        <Text position={[-1.72, -0.22, 0]} fontSize={0.14} color="#292a27" anchorX="left" anchorY="middle">
          Brand and content leads  ·  LinkedIn carousel
        </Text>
      </group>
      <group ref={ctaRef} position={[0, -0.92, 0.08]}>
        <mesh position={[0, 0.18, -0.005]}>
          <boxGeometry args={[3.35, 0.015, 0.012]} />
          <meshBasicMaterial color="#7f796f" transparent opacity={0.36} />
        </mesh>
        <Text position={[-1.72, -0.01, 0]} fontSize={0.1} color="#8a8172" anchorX="left" anchorY="middle">
          CTA / SAVE RATE +4.8% VS BASELINE
        </Text>
        <Text position={[-1.72, -0.2, 0]} fontSize={0.15} color="#292a27" anchorX="left" anchorY="middle">
          Save this checklist for your next brief.
        </Text>
      </group>
      <group ref={variationsRef} position={[0, -1.72, 0.08]}>
        <mesh position={[0, 0.2, -0.005]}>
          <boxGeometry args={[3.35, 0.015, 0.012]} />
          <meshBasicMaterial color="#7f796f" transparent opacity={0.36} />
        </mesh>
        <Text position={[-1.72, 0.03, 0]} fontSize={0.1} color="#8a8172" anchorX="left" anchorY="middle">
          THREE HOOK VARIATIONS / SAME MARKET SIGNAL
        </Text>
        {[
          ['A', 'Your brief starts too late.'],
          ['B', 'The best idea is hiding in the first question.'],
          ['C', 'A sharper question makes stronger creative.'],
        ].map(([id, hook], index) => (
          <group key={id} position={[0, -0.2 - index * 0.22, 0]}>
            <Text position={[-1.72, 0, 0]} fontSize={0.1} color="#b16043" anchorX="left" anchorY="middle">{id}</Text>
            <Text position={[-1.4, 0, 0]} fontSize={0.105} color="#35342e" anchorX="left" anchorY="middle" maxWidth={2.95}>{hook}</Text>
          </group>
        ))}
      </group>
    </group>
  );
};
